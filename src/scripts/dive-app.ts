import type { Dive, DiveProfiles } from '../types/dive'
import { sampleProfile, getDiveMapPoints } from './lib/dives'

declare global {
  interface Window {
    __DIVES_GPS__: Dive[];
    __DIVES_PROFILE__: Dive[];
    __DIVES_ALL__: Dive[];
    L: any;
    Chart: any;
  }
}

let leafletPromise: Promise<any> | null = null
let chartPromise: Promise<any> | null = null

function ensureLeafletLoaded(): Promise<any> {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="leaflet@1.9.4/dist/leaflet.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L), { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.head.appendChild(script)
  })

  return leafletPromise
}

function ensureChartLoaded(): Promise<any> {
  if (window.Chart) return Promise.resolve(window.Chart)
  if (chartPromise) return chartPromise

  chartPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="chart.js@4.4.0"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Chart), { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    script.onload = () => resolve(window.Chart)
    script.onerror = reject
    document.head.appendChild(script)
  })

  return chartPromise
}

// =====================
// Leaflet 地圖總覽
// =====================
function applyReadableDarkTiles(map: any, L: any) {
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  }).addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    pane: 'overlayPane',
    opacity: 0.9,
    maxZoom: 19,
  }).addTo(map)
}

async function initMap() {
  const L = await ensureLeafletLoaded()
  const isMobile = window.matchMedia('(max-width: 768px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const map = L.map('dive-map', {
    zoomControl: true,
    dragging: !isMobile,
    tap: false,
    scrollWheelZoom: false,
  })

  if (isMobile) {
    const mapEl = document.getElementById('dive-map')
    if (mapEl) {
      mapEl.addEventListener('touchstart', function (e: TouchEvent) {
        if (e.touches.length >= 2) map.dragging.enable()
      }, { passive: true })
      mapEl.addEventListener('touchend', function (e: TouchEvent) {
        if (e.touches.length < 2) map.dragging.disable()
      }, { passive: true })
    }
  }

  applyReadableDarkTiles(map, L)

  const dives: Dive[] = window.__DIVES_GPS__ || []
  if (!dives.length) return

  const icon = L.divIcon({
    html: `<div style="
      width:16px; height:16px; border-radius:50%;
      background:radial-gradient(circle at 35% 35%, #c8f7ff 0%, #67e8f9 42%, #06b6d4 100%);
      border:2px solid rgba(255,255,255,0.96);
      box-shadow: 0 0 0 3px rgba(6,182,212,0.22), 0 0 18px rgba(103,232,249,0.52);
    "></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  const markers: ReturnType<typeof L.marker>[] = []
  dives.forEach((d) => {
    if (d.lat == null || d.lon == null) return
    const marker = L.marker([d.lat, d.lon], { icon })
      .addTo(map)
      .bindTooltip(
        `<div style="font-family:sans-serif; color:#e2e8f0; min-width:160px; max-width:220px; word-break:break-word; white-space:normal; line-height:1.4;">
          <div style="font-weight:700; font-size:1rem; margin-bottom:4px; color:#f8fafc; line-height:1.3;">#${d.num} ${d.location || 'Unknown'}</div>
          <div style="color:#94a3b8; font-size:0.82rem;">${d.date}</div>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
            <span style="background:rgba(34,211,238,0.14);color:#a5f3fc;padding:2px 8px;border-radius:99px;font-size:0.78rem;border:1px solid rgba(34,211,238,0.24);">▼ ${d.max_depth}m</span>
            <span style="background:rgba(74,222,128,0.12);color:#bbf7d0;padding:2px 8px;border-radius:99px;font-size:0.78rem;border:1px solid rgba(74,222,128,0.2);">⏱ ${Math.floor(d.bottom_time ?? 0)}m</span>
            ${d.water_temp != null ? `<span style="background:rgba(250,204,21,0.12);color:#fde68a;padding:2px 8px;border-radius:99px;font-size:0.78rem;border:1px solid rgba(250,204,21,0.22);">🌡 ${d.water_temp}°C</span>` : ''}
          </div>
        </div>`,
        { sticky: true, direction: 'top', offset: [0, -10], className: 'dive-map-tooltip' }
      )
    markers.push(marker)
  })

  if (!markers.length) return
  const group = L.featureGroup(markers)
  map.fitBounds(group.getBounds().pad(0.3))
}

// =====================
// 每筆潛水的 lazy mini maps
// =====================
async function initDiveMiniMaps() {
  const dives: Dive[] = window.__DIVES_ALL__ || []
  const diveByNum = new Map(dives.map((d) => [d.num, d]))
  const mapInstances = new Map<number, any>()

  function refreshMapSize(diveNum: number, delay = 0) {
    const map = mapInstances.get(diveNum)
    if (!map) return
    window.setTimeout(() => map.invalidateSize(), delay)
  }

  function setFullscreenButtonState(btn: HTMLButtonElement, isFullscreen: boolean) {
    btn.setAttribute('aria-expanded', isFullscreen ? 'true' : 'false')
    btn.setAttribute('aria-label', isFullscreen ? '離開全螢幕地圖' : '全螢幕查看地圖')
    const label = btn.querySelector('span:last-child')
    if (label) label.textContent = isFullscreen ? '縮回' : '全螢幕'
  }

  function mapCaption(points: ReturnType<typeof getDiveMapPoints>): string {
    if (points.length === 2) return '綠色是入水點 IN，紅色是出水點 OUT'
    if (points[0]?.kind === 'entry') return '只有入水點座標 IN'
    if (points[0]?.kind === 'exit') return '只有出水點座標 OUT'
    return '沒有可顯示的 GPS 座標'
  }

  function makePointIcon(kind: 'entry' | 'exit', label: string) {
    const bg = kind === 'entry' ? '#22c55e' : '#f87171'
    return window.L.divIcon({
      className: '',
      iconSize: [34, 20],
      iconAnchor: [17, 10],
      html: `<div style="display:flex;align-items:center;justify-content:center;min-width:34px;height:20px;padding:0 7px;border-radius:999px;background:${bg};color:#0f172a;border:1px solid rgba(255,255,255,0.8);font:700 10px/1 sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.28);">${label}</div>`,
    })
  }

  async function buildMiniMap(diveNum: number) {
    if (mapInstances.has(diveNum)) {
      refreshMapSize(diveNum)
      return
    }

    const dive = diveByNum.get(diveNum)
    if (!dive) return

    const points = getDiveMapPoints(dive)
    const mapEl = document.getElementById(`mini-map-${diveNum}`)
    const captionEl = document.getElementById(`map-caption-${diveNum}`)
    if (!mapEl || !captionEl) return

    captionEl.textContent = mapCaption(points)
    if (!points.length) return

    const L = await ensureLeafletLoaded()
    const map = L.map(mapEl, {
      zoomControl: true,
      dragging: true,
      tap: false,
      scrollWheelZoom: false,
    })

    applyReadableDarkTiles(map, L)

    const latlngs = points.map((point) => [point.lat, point.lon])
    points.forEach((point) => {
      const label = point.kind === 'entry' ? 'IN' : 'OUT'
      L.marker([point.lat, point.lon], { icon: makePointIcon(point.kind, label) })
        .addTo(map)
        .bindTooltip(label, { direction: 'top', offset: [0, -10] })
    })

    if (latlngs.length === 2) {
      L.polyline(latlngs, {
        color: '#94a3b8',
        weight: 2,
        opacity: 0.8,
        dashArray: '4 6',
      }).addTo(map)
      map.fitBounds(L.latLngBounds(latlngs).pad(0.65))
    } else {
      map.setView(latlngs[0], 15)
    }

    refreshMapSize(diveNum)
    mapInstances.set(diveNum, map)
  }

  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll<HTMLButtonElement>('.map-fullscreen-toggle').forEach((btn) => {
      const diveNum = parseInt(btn.dataset.dive ?? '0', 10)
      const shell = document.getElementById(`mini-map-shell-${diveNum}`)
      const active = document.fullscreenElement === shell
      setFullscreenButtonState(btn, active)
      if (active || !document.fullscreenElement) {
        refreshMapSize(diveNum, 50)
      }
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.map-fullscreen-toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const diveNum = parseInt(btn.dataset.dive ?? '0', 10)
      const shell = document.getElementById(`mini-map-shell-${diveNum}`) as HTMLElement | null
      if (!shell) return

      if (document.fullscreenElement === shell) {
        await document.exitFullscreen()
        return
      }

      if (document.fullscreenElement && document.fullscreenElement !== shell) {
        await document.exitFullscreen()
      }

      await shell.requestFullscreen()
      refreshMapSize(diveNum, 50)
    })
  })

  document.querySelectorAll<HTMLButtonElement>('.mini-map-toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const diveNum = parseInt(btn.dataset.dive ?? '0', 10)
      const panel = document.getElementById(`map-panel-${diveNum}`)
      if (!panel) return

      const expanded = btn.getAttribute('aria-expanded') === 'true'
      if (expanded) {
        panel.hidden = true
        btn.setAttribute('aria-expanded', 'false')
      } else {
        panel.hidden = false
        btn.setAttribute('aria-expanded', 'true')
        await buildMiniMap(diveNum)
      }
    })
  })
}

// =====================
// Chart.js 深度曲線（收折式，懶載入）
// =====================
async function initChart() {
  await ensureChartLoaded()

  let profiles: DiveProfiles = {}
  try {
    const r = await fetch('/dive_profiles.json')
    profiles = (await r.json()) as DiveProfiles
  } catch (_e) {}

  const chartInstances = new Map<number, InstanceType<typeof window.Chart>>()

  function buildChart(diveNum: number): void {
    const canvas = document.getElementById(`chart-${diveNum}`) as HTMLCanvasElement | null
    if (!canvas) return
    if (chartInstances.has(diveNum)) return

    const profile = profiles[String(diveNum)]
    if (!profile?.length) return

    const hasHr = profile.some((p) => p.hr !== null)
    const sampled = sampleProfile(profile, 300)
    const isMobile = window.innerWidth < 640

    const chart = new window.Chart(canvas.getContext('2d')!, {
      type: 'line',
      data: {
        labels: sampled.map((p) => p.t.toFixed(1)),
        datasets: [
          {
            label: '深度 (m)',
            data: sampled.map((p) => -p.depth),
            borderColor: '#3bd3fd',
            backgroundColor: 'rgba(59,211,253,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
            yAxisID: 'yDepth',
          },
          ...(hasHr
            ? [
                {
                  label: '心率 (bpm)',
                  data: sampled.map((p) => p.hr),
                  borderColor: '#f87171',
                  backgroundColor: 'transparent',
                  fill: false,
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 1.5,
                  yAxisID: 'yHr',
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#9f9b93', font: { size: isMobile ? 10 : 12 }, boxWidth: isMobile ? 12 : 40 },
          },
          tooltip: {
            position: 'nearest',
            yAlign: isMobile ? 'bottom' : 'center',
            xAlign: 'center',
            caretPadding: isMobile ? 20 : 4,
            callbacks: {
              label: (c: any) => {
                if (c.dataset.label?.includes('深度')) return `深度: ${Math.abs(c.raw as number).toFixed(1)} m`
                return `心率: ${c.raw} bpm`
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#c8c0b4', maxTicksLimit: isMobile ? 4 : 10, font: { size: isMobile ? 10 : 12 } },
            grid: { color: '#dad4c8' },
            title: { display: !isMobile, text: '時間 (分鐘)', color: '#64748b' },
          },
          yDepth: {
            position: 'left',
            ticks: { color: '#3bd3fd', callback: (v: any) => Math.abs(v as number) + 'm', font: { size: isMobile ? 10 : 12 }, maxTicksLimit: isMobile ? 4 : 8 },
            grid: { color: '#dad4c8' },
            title: { display: !isMobile, text: '深度', color: '#3bd3fd' },
          },
          ...(hasHr ? {
            yHr: {
              position: 'right',
              ticks: { color: '#f87171', font: { size: isMobile ? 10 : 12 }, maxTicksLimit: isMobile ? 4 : 8 },
              grid: { drawOnChartArea: false },
              title: { display: !isMobile, text: 'BPM', color: '#f87171' },
            },
          } : {}),
        },
      },
    })
    chartInstances.set(diveNum, chart)
  }

  document.querySelectorAll<HTMLButtonElement>('.chart-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const diveNum = parseInt(btn.dataset.dive ?? '0', 10)
      const panel = document.getElementById(`chart-panel-${diveNum}`)
      if (!panel) return

      const expanded = btn.getAttribute('aria-expanded') === 'true'
      if (expanded) {
        panel.hidden = true
        btn.setAttribute('aria-expanded', 'false')
      } else {
        panel.hidden = false
        btn.setAttribute('aria-expanded', 'true')
        buildChart(diveNum)
      }
    })
  })
}

void initMap()
void initDiveMiniMaps()
void initChart()
