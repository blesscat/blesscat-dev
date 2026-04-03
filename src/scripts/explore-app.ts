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

function getYear(dateStr: string): number {
  return parseInt(dateStr.slice(0, 4), 10);
}

function fmtTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

// ── state ────────────────────────────────────────────────────

let map: any = null;
let chartInstance: any = null;
let showDives = true;
let showSki = true;
let yearMin = 2024;
let yearMax = new Date().getFullYear();
let selectedYearMin = yearMin;
let selectedYearMax = yearMax;
let allMarkers: { el: any; type: 'dive' | 'ski'; year: number }[] = [];
let profilesCache: Record<string, any[]> = {};

// ── load scripts ─────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// ── main ─────────────────────────────────────────────────────

async function init() {
  await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');

  // gesture handling
  const ghCss = document.createElement('link');
  ghCss.rel = 'stylesheet';
  ghCss.href = 'https://unpkg.com/leaflet-gesture-handling@1.4.0/dist/leaflet-gesture-handling.min.css';
  document.head.appendChild(ghCss);
  await loadScript('https://unpkg.com/leaflet-gesture-handling@1.4.0/dist/leaflet-gesture-handling.min.js');

  const dives: any[] = window.__EXPLORE_DIVES__ || [];
  const ski: any[] = window.__EXPLORE_SKI__ || [];

  // year range
  const allYears = [
    ...dives.map(d => getYear(d.date)),
    ...ski.map(d => getYear(d.date)),
  ];
  yearMin = Math.min(...allYears);
  yearMax = Math.max(...allYears);
  selectedYearMin = yearMin;
  selectedYearMax = yearMax;

  // prefetch profiles
  try {
    const r = await fetch('/dive_profiles.json');
    profilesCache = await r.json();
  } catch (_) {}

  initMap(dives, ski);
  initControls(dives, ski);
  updateStats(dives, ski);
}

// ── map ──────────────────────────────────────────────────────

function initMap(dives: any[], ski: any[]) {
  const L = window.L;
  map = L.map('explore-map', { zoomControl: true, attributionControl: false, gestureHandling: true });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
  }).addTo(map);

  L.control.attribution({ prefix: '© OpenStreetMap © CARTO', position: 'bottomright' }).addTo(map);

  buildMarkers(dives, ski);
  fitAll();
}

function makeIcon(color: string, count: number) {
  const L = window.L;
  const size = count > 1 ? 18 : 12;
  const badge = count > 1
    ? `<span style="position:absolute;top:-6px;right:-6px;background:#0a0e1a;color:${color};font-size:9px;font-weight:800;border:1px solid ${color};border-radius:99px;padding:0 4px;line-height:16px;min-width:16px;text-align:center;">${count}</span>`
    : '';
  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color}88;"></div>
      ${badge}
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function buildMarkers(dives: any[], ski: any[]) {
  const L = window.L;

  // clear old
  allMarkers.forEach(m => map.removeLayer(m.el));
  allMarkers = [];

  // ── group dives by location coord (round to 3dp) ──
  const diveGroups: Record<string, any[]> = {};
  dives.forEach(d => {
    if (d.lat == null || d.lon == null) return;
    const key = `${(+d.lat).toFixed(3)}_${(+d.lon).toFixed(3)}`;
    if (!diveGroups[key]) diveGroups[key] = [];
    diveGroups[key].push(d);
  });

  Object.values(diveGroups).forEach(group => {
    const count = group.length;
    const d0 = group[0];
    const marker = L.marker([d0.lat, d0.lon], { icon: makeIcon('#38bdf8', count) });
    marker.on('click', () => openDiveCard(group));
    marker.addTo(map);
    const year = getYear(d0.date);
    allMarkers.push({ el: marker, type: 'dive', year });
  });

  // ── group ski by resort ──
  const skiGroups: Record<string, any[]> = {};
  ski.forEach(d => {
    if (d.lat == null || d.lon == null) return;
    const key = d.resort.split('/')[0].trim();
    if (!skiGroups[key]) skiGroups[key] = [];
    skiGroups[key].push(d);
  });

  Object.values(skiGroups).forEach(group => {
    const count = group.length;
    const d0 = group[0];
    // average lat/lon for same resort
    const lat = group.reduce((s: number, d: any) => s + d.lat, 0) / group.length;
    const lon = group.reduce((s: number, d: any) => s + d.lon, 0) / group.length;
    const marker = L.marker([lat, lon], { icon: makeIcon('#818cf8', count) });
    marker.on('click', () => openSkiCard(group));
    marker.addTo(map);
    const year = getYear(d0.date);
    allMarkers.push({ el: marker, type: 'ski', year });
  });
}

function fitAll() {
  const visible = allMarkers.filter(m => map.hasLayer(m.el));
  if (!visible.length) return;
  const L = window.L;
  const group = L.featureGroup(visible.map(m => m.el));
  map.fitBounds(group.getBounds().pad(0.25));
}

function applyFilters() {
  allMarkers.forEach(({ el, type, year }) => {
    const typeOk = type === 'dive' ? showDives : showSki;
    const yearOk = year >= selectedYearMin && year <= selectedYearMax;
    if (typeOk && yearOk) {
      if (!map.hasLayer(el)) map.addLayer(el);
    } else {
      if (map.hasLayer(el)) map.removeLayer(el);
    }
  });

  const dives: any[] = window.__EXPLORE_DIVES__ || [];
  const ski: any[] = window.__EXPLORE_SKI__ || [];
  updateStats(dives, ski);
}

// ── info card ─────────────────────────────────────────────────

function openDiveCard(group: any[]) {
  const card = document.getElementById('info-card')!;
  const isMobile = window.innerWidth < 768;

  // sort by date desc
  group.sort((a, b) => b.date.localeCompare(a.date));
  const location = group[0].location || 'Unknown';

  let html = `
    <div class="card-header">
      <div class="card-type dive">🤿 潛水</div>
      <button class="card-close" id="card-close">✕</button>
    </div>
    <div class="card-title">${location}</div>
    <div class="card-count">${group.length} 次紀錄</div>
    <div class="card-entries">
  `;

  group.forEach((d, i) => {
    const chartId = `explore-chart-${d.num}`;
    const hasProfile = !!profilesCache[String(d.num)];
    html += `
      <div class="entry ${i > 0 ? 'entry-border' : ''}">
        <div class="entry-row">
          <span class="entry-num">#${d.num}</span>
          <span class="entry-date">${d.date}</span>
        </div>
        <div class="entry-pills">
          <span class="pill depth">▼ ${d.max_depth}m</span>
          <span class="pill time">⏱ ${Math.floor(d.bottom_time ?? 0)}m</span>
          ${d.water_temp != null ? `<span class="pill temp">🌡 ${d.water_temp}°C</span>` : ''}
          ${d.gas && d.gas !== 'Air' ? `<span class="pill gas">${d.gas}</span>` : ''}
          ${d.avg_hr ? `<span class="pill hr">♥ ${d.avg_hr}bpm</span>` : ''}
        </div>
        ${hasProfile ? `
          <button class="chart-btn" data-dive="${d.num}" data-chart="${chartId}">📈 深度曲線</button>
          <div class="chart-wrap" id="wrap-${d.num}" style="display:none">
            <canvas id="${chartId}" height="140"></canvas>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`;
  card.innerHTML = html;
  card.classList.add('open');

  document.getElementById('card-close')?.addEventListener('click', closeCard);

  // chart toggles
  card.querySelectorAll<HTMLButtonElement>('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const diveNum = parseInt(btn.dataset.dive!);
      const chartId = btn.dataset.chart!;
      const wrap = document.getElementById(`wrap-${diveNum}`)!;
      if (wrap.style.display === 'none') {
        wrap.style.display = 'block';
        btn.textContent = '📈 收起曲線';
        buildDiveChart(diveNum, chartId);
      } else {
        wrap.style.display = 'none';
        btn.textContent = '📈 深度曲線';
      }
    });
  });

  if (!isMobile) map.panBy([150, 0]);
}

function openSkiCard(group: any[]) {
  const card = document.getElementById('info-card')!;
  const isMobile = window.innerWidth < 768;

  group.sort((a, b) => b.date.localeCompare(a.date));
  const resort = group[0].resort.split('/')[0].trim();
  const totalRuns = group.reduce((s: number, d: any) => s + (d.runs || 0), 0);
  const totalVert = group.reduce((s: number, d: any) => s + (d.vertical_m || 0), 0);
  const maxSpeed = Math.max(...group.map((d: any) => d.top_speed_kmh || 0));

  let html = `
    <div class="card-header">
      <div class="card-type ski">⛷️ 滑雪</div>
      <button class="card-close" id="card-close">✕</button>
    </div>
    <div class="card-title">${resort}</div>
    <div class="card-count">${group.length} 天紀錄</div>
    <div class="card-summary">
      <div class="summary-item"><span class="s-num">${totalRuns}</span><span class="s-lbl">總 runs</span></div>
      <div class="summary-item"><span class="s-num">${(totalVert / 1000).toFixed(1)}km</span><span class="s-lbl">垂直落差</span></div>
      <div class="summary-item"><span class="s-num">${maxSpeed.toFixed(1)}</span><span class="s-lbl">最高速 km/h</span></div>
    </div>
    <div class="card-entries">
  `;

  group.forEach((d, i) => {
    html += `
      <div class="entry ${i > 0 ? 'entry-border' : ''}">
        <div class="entry-row">
          <span class="entry-date">${d.date}</span>
          <span class="entry-country">${d.country}</span>
        </div>
        <div class="entry-pills">
          <span class="pill runs">🎿 ${d.runs} runs</span>
          <span class="pill speed">💨 ${d.top_speed_kmh.toFixed(1)}km/h</span>
          <span class="pill vert">↕ ${(d.vertical_m / 1000).toFixed(2)}km</span>
          <span class="pill alt">🏔 ${d.peak_altitude_m.toFixed(0)}m</span>
          <span class="pill dur">⏱ ${fmtTime(d.duration_s)}</span>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  card.innerHTML = html;
  card.classList.add('open');

  document.getElementById('card-close')?.addEventListener('click', closeCard);
  if (!isMobile) map.panBy([150, 0]);
}

function closeCard() {
  const card = document.getElementById('info-card')!;
  card.classList.remove('open');
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}

// ── depth chart in card ───────────────────────────────────────

async function buildDiveChart(diveNum: number, canvasId: string) {
  await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');

  const profile = profilesCache[String(diveNum)];
  if (!profile?.length) return;

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;

  const step = Math.max(1, Math.floor(profile.length / 200));
  const sampled = profile.filter((_: any, i: number) => i % step === 0);

  if (chartInstance) chartInstance.destroy();
  chartInstance = new window.Chart(canvas.getContext('2d')!, {
    type: 'line',
    data: {
      labels: sampled.map((p: any) => p.t.toFixed(1)),
      datasets: [{
        label: '深度',
        data: sampled.map((p: any) => -p.depth),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c: any) => `深度: ${Math.abs(c.raw).toFixed(1)}m`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#475569', maxTicksLimit: 5, font: { size: 10 } },
          grid: { color: '#1e2535' },
        },
        y: {
          ticks: {
            color: '#38bdf8',
            callback: (v: any) => Math.abs(v) + 'm',
            maxTicksLimit: 5,
            font: { size: 10 },
          },
          grid: { color: '#1e2535' },
        },
      },
    },
  });
}

// ── controls ──────────────────────────────────────────────────

function initControls(dives: any[], ski: any[]) {
  // toggle buttons
  const btnDive = document.getElementById('toggle-dive')!;
  const btnSki = document.getElementById('toggle-ski')!;

  btnDive.addEventListener('click', () => {
    showDives = !showDives;
    btnDive.classList.toggle('off', !showDives);
    applyFilters();
  });
  btnSki.addEventListener('click', () => {
    showSki = !showSki;
    btnSki.classList.toggle('off', !showSki);
    applyFilters();
  });

  // year slider
  const slider = document.getElementById('year-slider') as HTMLInputElement;
  const sliderLabel = document.getElementById('year-label')!;

  if (yearMin === yearMax) {
    // only one year — hide slider
    document.getElementById('year-control')?.style.setProperty('display', 'none');
  } else {
    slider.min = String(yearMin);
    slider.max = String(yearMax);
    slider.value = String(yearMax);
    sliderLabel.textContent = `${yearMin} – ${yearMax}`;

    slider.addEventListener('input', () => {
      const val = parseInt(slider.value);
      selectedYearMin = yearMin;
      selectedYearMax = val;
      sliderLabel.textContent = val === yearMax ? `${yearMin} – ${yearMax}` : `${yearMin} – ${val}`;
      applyFilters();
    });
  }
}

// ── stats mini bar ────────────────────────────────────────────

function updateStats(dives: any[], ski: any[]) {
  const filteredDives = dives.filter(d => {
    const y = getYear(d.date);
    return d.lat != null && showDives && y >= selectedYearMin && y <= selectedYearMax;
  });
  const filteredSki = ski.filter(d => {
    const y = getYear(d.date);
    return d.lat != null && showSki && y >= selectedYearMin && y <= selectedYearMax;
  });

  const diveSites = new Set(filteredDives.map(d =>
    `${(+d.lat).toFixed(3)}_${(+(d.lon as number)).toFixed(3)}`
  )).size;

  const skiResorts = new Set(filteredSki.map(d => d.resort.split('/')[0].trim())).size;

  const countries = new Set([
    ...filteredDives.map(d => (d.location || '').split(', ').pop() || ''),
    ...filteredSki.map(d => d.country),
  ].filter(Boolean)).size;

  const el = document.getElementById('explore-stats')!;
  el.innerHTML = `
    <span class="stat-item dive-stat">🤿 <strong>${diveSites}</strong> 個潛點</span>
    <span class="stat-sep">·</span>
    <span class="stat-item ski-stat">⛷️ <strong>${skiResorts}</strong> 個雪場</span>
    <span class="stat-sep">·</span>
    <span class="stat-item">🌏 <strong>${countries}</strong> 個國家</span>
  `;
}

// ── kick off ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
