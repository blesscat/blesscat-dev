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

  const dives: any[] = window.__EXPLORE_DIVES__ || [];
  const ski: any[] = window.__EXPLORE_SKI__ || [];

  const allYears = [
    ...dives.map(d => getYear(d.date)),
    ...ski.map(d => getYear(d.date)),
  ];
  yearMin = Math.min(...allYears);
  yearMax = Math.max(...allYears);
  selectedYearMin = yearMin;
  selectedYearMax = yearMax;

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
  const isMobile = window.matchMedia('(max-width: 768px)').matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  map = L.map('explore-map', {
    zoomControl: true,
    attributionControl: false,
    dragging: !isMobile,
    tap: false,
    scrollWheelZoom: false,
  });

  if (isMobile) {
    const mapEl = document.getElementById('explore-map');
    if (mapEl) {
      mapEl.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length >= 2) map.dragging.enable();
      }, { passive: true });
      mapEl.addEventListener('touchend', (e: TouchEvent) => {
        if (e.touches.length < 2) map.dragging.disable();
      }, { passive: true });
    }
  }

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
  allMarkers.forEach(m => map.removeLayer(m.el));
  allMarkers = [];

  const diveGroups: Record<string, any[]> = {};
  dives.forEach(d => {
    if (d.lat == null || d.lon == null) return;
    const key = `${(+d.lat).toFixed(3)}_${(+d.lon).toFixed(3)}`;
    if (!diveGroups[key]) diveGroups[key] = [];
    diveGroups[key].push(d);
  });

  Object.values(diveGroups).forEach(group => {
    const d0 = group[0];
    const marker = L.marker([d0.lat, d0.lon], { icon: makeIcon('#38bdf8', group.length) });
    marker.on('click', () => openDiveCard(group));
    marker.addTo(map);
    allMarkers.push({ el: marker, type: 'dive', year: getYear(d0.date) });
  });

  const skiGroups: Record<string, any[]> = {};
  ski.forEach(d => {
    if (d.lat == null || d.lon == null) return;
    const key = d.resort.split('/')[0].trim();
    if (!skiGroups[key]) skiGroups[key] = [];
    skiGroups[key].push(d);
  });

  Object.values(skiGroups).forEach(group => {
    const d0 = group[0];
    const lat = group.reduce((s: number, d: any) => s + d.lat, 0) / group.length;
    const lon = group.reduce((s: number, d: any) => s + d.lon, 0) / group.length;
    const marker = L.marker([lat, lon], { icon: makeIcon('#818cf8', group.length) });
    marker.on('click', () => openSkiCard(group));
    marker.addTo(map);
    allMarkers.push({ el: marker, type: 'ski', year: getYear(d0.date) });
  });
}

function fitAll() {
  const visible = allMarkers.filter(m => map.hasLayer(m.el));
  if (!visible.length) return;
  const group = window.L.featureGroup(visible.map(m => m.el));
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
  updateStats(window.__EXPLORE_DIVES__ || [], window.__EXPLORE_SKI__ || []);
}

// ── info card ─────────────────────────────────────────────────

// shared inline styles
const S = {
  cardHeader: 'display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem 0.75rem;border-bottom:1px solid #1e2535;position:sticky;top:0;background:#0d1220ee;backdrop-filter:blur(8px);z-index:10;',
  cardTypeDive: 'font-size:0.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:0.2rem 0.6rem;border-radius:99px;background:rgba(56,189,248,0.15);color:#38bdf8;',
  cardTypeSki: 'font-size:0.72rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:0.2rem 0.6rem;border-radius:99px;background:rgba(129,140,248,0.15);color:#818cf8;',
  cardClose: 'background:transparent;border:none;color:#475569;font-size:0.9rem;cursor:pointer;padding:0.25rem 0.5rem;border-radius:4px;',
  cardTitle: 'font-size:1.1rem;font-weight:800;color:#e2e8f0;padding:0.9rem 1.2rem 0.2rem;line-height:1.3;',
  cardCount: 'font-size:0.72rem;color:#475569;padding:0 1.2rem 0.75rem;letter-spacing:1px;text-transform:uppercase;',
  cardSummary: 'display:flex;gap:0;border-top:1px solid #1e2535;border-bottom:1px solid #1e2535;margin-bottom:0.5rem;',
  summaryItem: 'flex:1;display:flex;flex-direction:column;align-items:center;padding:0.75rem 0.5rem;border-right:1px solid #1e2535;',
  summaryItemLast: 'flex:1;display:flex;flex-direction:column;align-items:center;padding:0.75rem 0.5rem;',
  sNum: 'font-size:1.1rem;font-weight:800;color:#818cf8;',
  sLbl: 'font-size:0.6rem;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-top:2px;',
  cardEntries: 'padding:0 1.2rem 1.5rem;',
  entry: 'padding:0.75rem 0;',
  entryBorder: 'padding:0.75rem 0;border-top:1px solid #1e2535;',
  entryRow: 'display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem;',
  entryNum: 'font-size:0.72rem;color:#475569;font-weight:700;',
  entryDate: 'font-size:0.78rem;color:#64748b;',
  entryCountry: 'font-size:0.72rem;color:#475569;margin-left:auto;',
  entryPills: 'display:flex;gap:0.3rem;flex-wrap:wrap;',
  pill: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;',
  pillDepth: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#0c2d48;color:#38bdf8;',
  pillTime: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#1a1a2e;color:#818cf8;',
  pillTemp: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#1a2e1a;color:#4ade80;',
  pillGas: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#2e1a1a;color:#f87171;',
  pillHr: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#2e1a1a;color:#fb7185;',
  pillRuns: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#1e1a2e;color:#818cf8;',
  pillSpeed: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#2e1a1a;color:#f87171;',
  pillVert: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#0c2d48;color:#38bdf8;',
  pillAlt: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#1a2e1a;color:#4ade80;',
  pillDur: 'padding:0.18rem 0.5rem;border-radius:99px;font-size:0.7rem;font-weight:600;background:#1a1a2e;color:#818cf8;',
  chartBtn: 'margin-top:0.4rem;font-size:0.72rem;color:#38bdf8;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:6px;padding:0.2rem 0.5rem;cursor:pointer;',
};

function openInfoCard() {
  const card = document.getElementById('info-card')!;
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    card.style.bottom = '0';
    card.style.right = '0';
  } else {
    card.style.right = '0';
    map.panBy([150, 0]);
  }
}

function openDiveCard(group: any[]) {
  const card = document.getElementById('info-card')!;
  group.sort((a, b) => b.date.localeCompare(a.date));
  const location = group[0].location || 'Unknown';

  let html = `
    <div style="${S.cardHeader}">
      <div style="${S.cardTypeDive}">🤿 潛水</div>
      <button style="${S.cardClose}" id="card-close">✕</button>
    </div>
    <div style="${S.cardTitle}">${location}</div>
    <div style="${S.cardCount}">${group.length} 次紀錄</div>
    <div style="${S.cardEntries}">
  `;

  group.forEach((d, i) => {
    const chartId = `explore-chart-${d.num}`;
    const hasProfile = !!profilesCache[String(d.num)];
    html += `
      <div class="entry-item" style="${i > 0 ? S.entryBorder : S.entry}">
        <div style="${S.entryRow}">
          <span style="${S.entryNum}">#${d.num}</span>
          <span style="${S.entryDate}">${d.date}</span>
        </div>
        <div style="${S.entryPills}">
          <span style="${S.pillDepth}">▼ ${d.max_depth}m</span>
          <span style="${S.pillTime}">⏱ ${Math.floor(d.bottom_time ?? 0)}m</span>
          ${d.water_temp != null ? `<span style="${S.pillTemp}">🌡 ${d.water_temp}°C</span>` : ''}
          ${d.gas && d.gas !== 'Air' ? `<span style="${S.pillGas}">${d.gas}</span>` : ''}
          ${d.avg_hr ? `<span style="${S.pillHr}">♥ ${d.avg_hr}bpm</span>` : ''}
        </div>
        ${hasProfile ? `
          <button style="${S.chartBtn}" class="chart-btn" data-dive="${d.num}" data-chart="${chartId}">📈 深度曲線</button>
          <div id="wrap-${d.num}" style="display:none">
            <canvas id="${chartId}" height="140"></canvas>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`;
  card.innerHTML = html;
  openInfoCard();

  document.getElementById('card-close')?.addEventListener('click', closeCard);

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
}

function openSkiCard(group: any[]) {
  const card = document.getElementById('info-card')!;
  group.sort((a, b) => b.date.localeCompare(a.date));
  const resort = group[0].resort.split('/')[0].trim();
  const totalRuns = group.reduce((s: number, d: any) => s + (d.runs || 0), 0);
  const totalVert = group.reduce((s: number, d: any) => s + (d.vertical_m || 0), 0);
  const maxSpeed = Math.max(...group.map((d: any) => d.top_speed_kmh || 0));

  let html = `
    <div style="${S.cardHeader}">
      <div style="${S.cardTypeSki}">⛷️ 滑雪</div>
      <button style="${S.cardClose}" id="card-close">✕</button>
    </div>
    <div style="${S.cardTitle}">${resort}</div>
    <div style="${S.cardCount}">${group.length} 天紀錄</div>
    <div style="${S.cardSummary}">
      <div style="${S.summaryItem}"><span style="${S.sNum}">${totalRuns}</span><span style="${S.sLbl}">總 runs</span></div>
      <div style="${S.summaryItem}"><span style="${S.sNum}">${(totalVert / 1000).toFixed(1)}km</span><span style="${S.sLbl}">垂直落差</span></div>
      <div style="${S.summaryItemLast}"><span style="${S.sNum}">${maxSpeed.toFixed(1)}</span><span style="${S.sLbl}">最高速 km/h</span></div>
    </div>
    <div style="${S.cardEntries}">
  `;

  group.forEach((d, i) => {
    html += `
      <div style="${i > 0 ? S.entryBorder : S.entry}">
        <div style="${S.entryRow}">
          <span style="${S.entryDate}">${d.date}</span>
          <span style="${S.entryCountry}">${d.country}</span>
        </div>
        <div style="${S.entryPills}">
          <span style="${S.pillRuns}">🎿 ${d.runs} runs</span>
          <span style="${S.pillSpeed}">💨 ${d.top_speed_kmh.toFixed(1)}km/h</span>
          <span style="${S.pillVert}">↕ ${(d.vertical_m / 1000).toFixed(2)}km</span>
          <span style="${S.pillAlt}">🏔 ${d.peak_altitude_m.toFixed(0)}m</span>
          <span style="${S.pillDur}">⏱ ${fmtTime(d.duration_s)}</span>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  card.innerHTML = html;
  openInfoCard();

  document.getElementById('card-close')?.addEventListener('click', closeCard);
}

function closeCard() {
  const card = document.getElementById('info-card')!;
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    card.style.bottom = '-100%';
  } else {
    card.style.right = '-360px';
  }
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
        tooltip: { callbacks: { label: (c: any) => `深度: ${Math.abs(c.raw).toFixed(1)}m` } },
      },
      scales: {
        x: { ticks: { color: '#475569', maxTicksLimit: 5, font: { size: 10 } }, grid: { color: '#1e2535' } },
        y: { ticks: { color: '#38bdf8', callback: (v: any) => Math.abs(v) + 'm', maxTicksLimit: 5, font: { size: 10 } }, grid: { color: '#1e2535' } },
      },
    },
  });
}

// ── controls ──────────────────────────────────────────────────

function initControls(dives: any[], ski: any[]) {
  const btnDive = document.getElementById('toggle-dive')!;
  const btnSki = document.getElementById('toggle-ski')!;
  const dotDive = btnDive.querySelector('.dot') as HTMLElement | null;
  const dotSki = btnSki.querySelector('.dot') as HTMLElement | null;

  // off state styles
  const offStyle = { bg: 'transparent', border: '#1e2535', color: '#475569', dot: '#475569' };
  const diveOnStyle = { bg: 'rgba(56,189,248,0.12)', border: '#38bdf8', color: '#38bdf8', dot: '#38bdf8' };
  const skiOnStyle = { bg: 'rgba(129,140,248,0.12)', border: '#818cf8', color: '#818cf8', dot: '#818cf8' };

  function applyBtnStyle(btn: HTMLElement, dot: HTMLElement | null, on: boolean, onStyle: typeof diveOnStyle) {
    const s = on ? onStyle : offStyle;
    btn.style.background = s.bg;
    btn.style.borderColor = s.border;
    btn.style.color = s.color;
    if (dot) dot.style.background = s.dot;
  }

  btnDive.addEventListener('click', () => {
    showDives = !showDives;
    applyBtnStyle(btnDive, dotDive, showDives, diveOnStyle);
    applyFilters();
  });
  btnSki.addEventListener('click', () => {
    showSki = !showSki;
    applyBtnStyle(btnSki, dotSki, showSki, skiOnStyle);
    applyFilters();
  });

  const slider = document.getElementById('year-slider') as HTMLInputElement;
  const sliderLabel = document.getElementById('year-label')!;

  if (yearMin === yearMax) {
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
    <span style="color:#94a3b8;">🤿 <strong style="color:#38bdf8;">${diveSites}</strong> 個潛點</span>
    <span style="color:#1e2535;">·</span>
    <span style="color:#94a3b8;">⛷️ <strong style="color:#818cf8;">${skiResorts}</strong> 個雪場</span>
    <span style="color:#1e2535;">·</span>
    <span style="color:#94a3b8;">🌏 <strong style="color:#e2e8f0;">${countries}</strong> 個國家</span>
  `;
}

// ── kick off ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
