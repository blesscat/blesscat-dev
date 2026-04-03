// ============================================================
// explore-app.ts — Interactive Explore Map
// ============================================================

declare global {
  interface Window {
    L: any;
    Chart: any;
    __EXPLORE_DIVES__: any[];
    __EXPLORE_SKI__: any[];
    __DIVE_PROFILES__: Record<string, any[]>;
  }
}

// ── helpers ──────────────────────────────────────────────────

import { getYear, groupDivesByLocation, groupSkiByResort, countCountries } from './lib/explore'

// ── state ────────────────────────────────────────────────────

let map: any = null
let showDives = true
let showSki = true
let yearMin = 2024
let yearMax = new Date().getFullYear()
let selectedYearMin = yearMin
let selectedYearMax = yearMax
let allMarkers: { el: any; type: 'dive' | 'ski'; year: number }[] = []
let profilesCache: Record<string, any[]> = {}

// ── load scripts ─────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

// ── main ─────────────────────────────────────────────────────

async function init() {
  await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')

  const dives: any[] = window.__EXPLORE_DIVES__ || []
  const ski: any[] = window.__EXPLORE_SKI__ || []

  const allYears = [
    ...dives.map(d => getYear(d.date)),
    ...ski.map(d => getYear(d.date)),
  ]
  yearMin = Math.min(...allYears)
  yearMax = Math.max(...allYears)
  selectedYearMin = yearMin
  selectedYearMax = yearMax

  try {
    const r = await fetch('/dive_profiles.json')
    profilesCache = await r.json()
  } catch (_) {}

  initMap(dives, ski)
  initControls(dives, ski)
  updateStats(dives, ski)

  let isCardOpen = false
  window.addEventListener('explore:card-opened', () => {
    if (map && window.innerWidth >= 768 && !isCardOpen) {
      map.panBy([150, 0])
      isCardOpen = true
    }
  })
  window.addEventListener('explore:card-closed', () => {
    if (map && window.innerWidth >= 768 && isCardOpen) {
      map.panBy([-150, 0])
      isCardOpen = false
    }
  })
}

// ── map ──────────────────────────────────────────────────────

function initMap(dives: any[], ski: any[]) {
  const L = window.L
  const isMobile = window.matchMedia('(max-width: 768px)').matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  map = L.map('explore-map', {
    zoomControl: true,
    attributionControl: false,
    dragging: !isMobile,
    tap: false,
    scrollWheelZoom: false,
  })

  if (isMobile) {
    const mapEl = document.getElementById('explore-map')
    if (mapEl) {
      mapEl.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length >= 2) map.dragging.enable()
      }, { passive: true })
      mapEl.addEventListener('touchend', (e: TouchEvent) => {
        if (e.touches.length < 2) map.dragging.disable()
      }, { passive: true })
    }
  }

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
  }).addTo(map)

  L.control.attribution({ prefix: '© OpenStreetMap © CARTO', position: 'bottomright' }).addTo(map)

  buildMarkers(dives, ski)
  fitAll()
}

function makeIcon(color: string, count: number) {
  const L = window.L
  const size = count > 1 ? 18 : 12
  const badge = count > 1
    ? `<span style="position:absolute;top:-6px;right:-6px;background:#0a0e1a;color:${color};font-size:9px;font-weight:800;border:1px solid ${color};border-radius:99px;padding:0 4px;line-height:16px;min-width:16px;text-align:center;">${count}</span>`
    : ''
  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color}88;"></div>
      ${badge}
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function buildMarkers(dives: any[], ski: any[]) {
  const L = window.L
  allMarkers.forEach(m => map.removeLayer(m.el))
  allMarkers = []

  const diveGroups = groupDivesByLocation(dives)

  Object.values(diveGroups).forEach(group => {
    const d0 = group[0]
    const marker = L.marker([d0.lat, d0.lon], { icon: makeIcon('#38bdf8', group.length) })
    marker.on('click', () => {
      window.dispatchEvent(new CustomEvent('explore:open-dive', {
        detail: { group, profiles: profilesCache },
      }))
    })
    marker.addTo(map)
    allMarkers.push({ el: marker, type: 'dive', year: getYear(d0.date) })
  })

  const skiGroups = groupSkiByResort(ski)

  Object.values(skiGroups).forEach(group => {
    const d0 = group[0]
    const lat = group.reduce((s: number, d: any) => s + d.lat, 0) / group.length
    const lon = group.reduce((s: number, d: any) => s + d.lon, 0) / group.length
    const marker = L.marker([lat, lon], { icon: makeIcon('#818cf8', group.length) })
    marker.on('click', () => {
      window.dispatchEvent(new CustomEvent('explore:open-ski', {
        detail: { group },
      }))
    })
    marker.addTo(map)
    allMarkers.push({ el: marker, type: 'ski', year: getYear(d0.date) })
  })
}

function fitAll() {
  const visible = allMarkers.filter(m => map.hasLayer(m.el))
  if (!visible.length) return
  const group = window.L.featureGroup(visible.map(m => m.el))
  map.fitBounds(group.getBounds().pad(0.25))
}

function applyFilters() {
  allMarkers.forEach(({ el, type, year }) => {
    const typeOk = type === 'dive' ? showDives : showSki
    const yearOk = year >= selectedYearMin && year <= selectedYearMax
    if (typeOk && yearOk) {
      if (!map.hasLayer(el)) map.addLayer(el)
    } else {
      if (map.hasLayer(el)) map.removeLayer(el)
    }
  })
  updateStats(window.__EXPLORE_DIVES__ || [], window.__EXPLORE_SKI__ || [])
}

// ── controls ──────────────────────────────────────────────────

function initControls(_dives: any[], _ski: any[]) {
  const btnDive = document.getElementById('toggle-dive')!
  const btnSki = document.getElementById('toggle-ski')!
  const dotDive = btnDive.querySelector('.dot') as HTMLElement | null
  const dotSki = btnSki.querySelector('.dot') as HTMLElement | null

  // off state styles
  const offStyle = { bg: 'transparent', border: '#1e2535', color: '#475569', dot: '#475569' }
  const diveOnStyle = { bg: 'rgba(56,189,248,0.12)', border: '#38bdf8', color: '#38bdf8', dot: '#38bdf8' }
  const skiOnStyle = { bg: 'rgba(129,140,248,0.12)', border: '#818cf8', color: '#818cf8', dot: '#818cf8' }

  function applyBtnStyle(btn: HTMLElement, dot: HTMLElement | null, on: boolean, onStyle: typeof diveOnStyle) {
    const s = on ? onStyle : offStyle
    btn.style.background = s.bg
    btn.style.borderColor = s.border
    btn.style.color = s.color
    if (dot) dot.style.background = s.dot
  }

  btnDive.addEventListener('click', () => {
    showDives = !showDives
    applyBtnStyle(btnDive, dotDive, showDives, diveOnStyle)
    applyFilters()
  })
  btnSki.addEventListener('click', () => {
    showSki = !showSki
    applyBtnStyle(btnSki, dotSki, showSki, skiOnStyle)
    applyFilters()
  })

  const slider = document.getElementById('year-slider') as HTMLInputElement
  const sliderLabel = document.getElementById('year-label')!

  if (yearMin === yearMax) {
    document.getElementById('year-control')?.style.setProperty('display', 'none')
  } else {
    slider.min = String(yearMin)
    slider.max = String(yearMax)
    slider.value = String(yearMax)
    sliderLabel.textContent = `${yearMin} – ${yearMax}`

    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10)
      selectedYearMin = yearMin
      selectedYearMax = val
      sliderLabel.textContent = val === yearMax ? `${yearMin} – ${yearMax}` : `${yearMin} – ${val}`
      applyFilters()
    })
  }
}

// ── stats mini bar ────────────────────────────────────────────

function updateStats(dives: any[], ski: any[]) {
  const filteredDives = dives.filter(d => {
    const y = getYear(d.date)
    return d.lat != null && showDives && y >= selectedYearMin && y <= selectedYearMax
  })
  const filteredSki = ski.filter(d => {
    const y = getYear(d.date)
    return d.lat != null && showSki && y >= selectedYearMin && y <= selectedYearMax
  })

  const diveSites = Object.keys(groupDivesByLocation(filteredDives)).length
  const skiResorts = Object.keys(groupSkiByResort(filteredSki)).length
  const countries = countCountries(filteredDives, filteredSki)

  const el = document.getElementById('explore-stats')!
  el.innerHTML = `
    <span style="color:#94a3b8;">🤿 <strong style="color:#38bdf8;">${diveSites}</strong> 個潛點</span>
    <span style="color:#1e2535;">·</span>
    <span style="color:#94a3b8;">⛷️ <strong style="color:#818cf8;">${skiResorts}</strong> 個雪場</span>
    <span style="color:#1e2535;">·</span>
    <span style="color:#94a3b8;">🌏 <strong style="color:#e2e8f0;">${countries}</strong> 個國家</span>
  `
}

// ── kick off ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init)

export {}
