// ski-app.ts — map + charts + filter for ski page

declare global {
  interface Window {
    L: any;
    Chart: any;
    __SKI_DATA__: any[];
    __SKI_MONTHS__: string[];
    __SKI_MONTH_COUNT__: Record<string, number>;
    __SKI_TOTAL__: number;
    __SKI_YEAR_DATA__: { labels: string[]; days: number[] };
  }
}

const $ = <T extends Element = Element>(sel: string) =>
  document.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  document.querySelectorAll<T>(sel);

function getCtx(name: string) {
  return $<HTMLCanvasElement>(`[data-chart="${name}"]`)?.getContext('2d') ?? null;
}

// ── 地圖 ───────────────────────────────────────────────────────

(function initMap() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function () {
    const L = window.L;
    const data = window.__SKI_DATA__ || [];
    const isMobile = window.matchMedia('(max-width: 768px)').matches ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const map = L.map('ski-map', {
      zoomControl: true, dragging: !isMobile, tap: false, scrollWheelZoom: false,
    });

    if (isMobile) {
      const mapEl = $('#ski-map');
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
      attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 18,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="width:12px;height:12px;border-radius:50%;background:#818cf8;border:2px solid #fff;box-shadow:0 0 8px #818cf8;"></div>`,
      className: '', iconSize: [12, 12], iconAnchor: [6, 6],
    });

    const markers: ReturnType<typeof L.marker>[] = [];
    data.forEach((d: any) => {
      if (d.lat == null || d.lon == null) return;
      const marker = L.marker([d.lat, d.lon], { icon }).addTo(map).bindTooltip(
        `<div style="font-family:sans-serif;color:#0f172a;min-width:140px;max-width:200px;word-break:break-word;white-space:normal;">
          <div style="font-weight:700;font-size:1rem;margin-bottom:4px;line-height:1.3;">${d.resort}</div>
          <div style="color:#64748b;font-size:0.82rem;">${d.date}</div>
          <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
            <span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:99px;font-size:0.78rem;">🎿 ${d.runs} runs</span>
            <span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:99px;font-size:0.78rem;">💨 ${d.top_speed_kmh.toFixed(1)}km/h</span>
            <span style="background:#f0fdf4;color:#16a34a;padding:2px 8px;border-radius:99px;font-size:0.78rem;">🏔 ${d.peak_altitude_m.toFixed(0)}m</span>
          </div>
        </div>`,
        { sticky: true }
      );
      markers.push(marker);
    });

    if (markers.length) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.3));
    }
  };
  document.head.appendChild(script);
})();

// ── Charts ─────────────────────────────────────────────────────

(function initCharts() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  script.onload = function () {
    const data: any[] = window.__SKI_DATA__ || [];
    const months: string[] = window.__SKI_MONTHS__ || [];
    const monthCount: Record<string, number> = window.__SKI_MONTH_COUNT__ || {};
    const isMobile = window.innerWidth < 640;
    const C = window.Chart;

    // 速度分布
    const sorted = [...data].sort((a, b) => b.top_speed_kmh - a.top_speed_kmh);
    const speedCtx = getCtx('speed');
    if (speedCtx) new C(speedCtx, {
      type: 'bar',
      data: {
        labels: sorted.map(d => isMobile ? d.date.slice(5) : d.date),
        datasets: [{ label: '最高速度 (km/h)', data: sorted.map(d => d.top_speed_kmh.toFixed(1)),
          backgroundColor: sorted.map(d => d.top_speed_kmh === Math.max(...data.map((x: any) => x.top_speed_kmh)) ? '#f87171' : '#818cf8'),
          borderRadius: 4 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.raw} km/h` } } },
        scales: {
          x: { ticks: { color: '#475569', font: { size: isMobile ? 9 : 11 }, maxRotation: 45 }, grid: { color: '#1e2535' } },
          y: { ticks: { color: '#818cf8', font: { size: isMobile ? 10 : 12 }, callback: (v: any) => v + ' km/h' }, grid: { color: '#1e2535' } },
        },
      },
    });

    // 月份分布
    const monthCtx = getCtx('month');
    if (monthCtx) new C(monthCtx, {
      type: 'bar',
      data: { labels: months, datasets: [{ label: '滑雪天數', data: months.map(m => monthCount[m]), backgroundColor: '#38bdf8', borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.raw} 天` } } },
        scales: {
          x: { ticks: { color: '#475569', font: { size: isMobile ? 10 : 12 } }, grid: { color: '#1e2535' } },
          y: { ticks: { color: '#38bdf8', font: { size: isMobile ? 10 : 12 }, stepSize: 1 }, grid: { color: '#1e2535' } },
        },
      },
    });

    // 速度 vs 垂直落差散點圖
    const scatterData = data.filter(d => d.vertical_m != null && d.top_speed_kmh != null)
      .map(d => ({ x: parseFloat((d.vertical_m / 1000).toFixed(2)), y: parseFloat(d.top_speed_kmh.toFixed(1)), resort: d.resort, date: d.date }));
    const scatterCtx = getCtx('scatter');
    if (scatterCtx) new C(scatterCtx, {
      type: 'scatter',
      data: { datasets: [{ label: '速度 vs 垂直落差', data: scatterData, backgroundColor: '#f87171', pointRadius: 8, pointHoverRadius: 10 }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => {
          const d = scatterData[c.dataIndex]; return [`${d.resort}`, `${d.date}`, `垂直: ${c.parsed.x}km  速度: ${c.parsed.y}km/h`];
        } } } },
        scales: {
          x: { title: { display: true, text: '垂直落差 (km)', color: '#475569', font: { size: 11 } }, ticks: { color: '#475569', font: { size: isMobile ? 9 : 11 } }, grid: { color: '#1e2535' } },
          y: { title: { display: true, text: '最高速 (km/h)', color: '#475569', font: { size: 11 } }, ticks: { color: '#f87171', font: { size: isMobile ? 10 : 12 }, callback: (v: any) => v + ' km/h' }, grid: { color: '#1e2535' } },
        },
      },
    });

    // 雪場比較
    const resortRuns: Record<string, number> = {};
    data.forEach(d => { const n = d.resort.split('/')[0].trim(); resortRuns[n] = (resortRuns[n] || 0) + (d.runs || 0); });
    const resortsSorted = Object.entries(resortRuns).sort((a, b) => b[1] - a[1]);
    const resortCtx = getCtx('resort');
    if (resortCtx) new C(resortCtx, {
      type: 'bar',
      data: { labels: resortsSorted.map(r => r[0]), datasets: [{ label: '總 runs', data: resortsSorted.map(r => r[1]), backgroundColor: '#818cf8', borderRadius: 4 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `${c.raw} runs` } } },
        scales: {
          x: { ticks: { color: '#818cf8', font: { size: isMobile ? 9 : 11 }, callback: (v: any) => v + ' runs' }, grid: { color: '#1e2535' } },
          y: { ticks: { color: '#94a3b8', font: { size: isMobile ? 9 : 11 } }, grid: { color: '#1e2535' } },
        },
      },
    });

    // 年度比較
    const yearData = window.__SKI_YEAR_DATA__;
    const yearCtx = getCtx('year-compare');
    if (yearData && yearCtx) new C(yearCtx, {
      type: 'bar',
      data: {
        labels: yearData.labels,
        datasets: [
          { label: '滑雪天數', data: yearData.days, backgroundColor: ['#38bdf8', '#818cf8', '#4ade80'], borderRadius: 6, borderSkipped: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: true, labels: { color: '#94a3b8', font: { size: 12 } } }, tooltip: { callbacks: { label: (c: any) => ` ${c.raw} 天` } } },
        scales: {
          x: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8', font: { size: 13 } } },
          y: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
        },
      },
    });
  };
  document.head.appendChild(script);
})();

// ── 搜尋篩選 ───────────────────────────────────────────────────

(function initFilter() {
  const searchEl = $<HTMLInputElement>('[data-ref="search"]');
  const yearEl = $<HTMLSelectElement>('[data-ref="year-select"]');
  const countEl = $('[data-ref="count"]');
  const rows = $$('.ski-row');
  const total = window.__SKI_TOTAL__ || rows.length;

  function applyFilter() {
    const keyword = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const year = yearEl ? yearEl.value : '';
    let visible = 0;
    rows.forEach(row => {
      const resort = (row.querySelector('.ski-resort')?.textContent || '').toLowerCase();
      const date = (row.querySelector('.ski-date')?.textContent || '');
      const match = (!keyword || resort.includes(keyword)) && (!year || date.startsWith(year));
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (countEl) countEl.textContent = `顯示 ${visible} / ${total} 筆`;
  }

  searchEl?.addEventListener('input', applyFilter);
  yearEl?.addEventListener('change', applyFilter);
  applyFilter();
})();
