import type { Dive, DiveProfiles } from '../types/dive';

declare global {
  interface Window {
    __DIVES_GPS__: Dive[];
    __DIVES_PROFILE__: Dive[];
    L: typeof import('leaflet');
    Chart: typeof import('chart.js').Chart;
  }
}

// =====================
// Leaflet 地圖
// =====================
(function initMap(): void {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function () {
    const L = window.L;
    const map = L.map('dive-map', { zoomControl: true });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    const dives: Dive[] = window.__DIVES_GPS__ || [];
    if (!dives.length) return;

    const icon = L.divIcon({
      html: `<div style="
        width:12px; height:12px; border-radius:50%;
        background:#38bdf8; border:2px solid #fff;
        box-shadow: 0 0 8px #38bdf8;
      "></div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    const markers: ReturnType<typeof L.marker>[] = [];
    dives.forEach((d) => {
      if (d.lat == null || d.lon == null) return;
      const marker = L.marker([d.lat, d.lon], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-family:sans-serif; color:#0f172a; min-width:160px;">
            <div style="font-weight:700; font-size:1rem; margin-bottom:4px;">#${d.num} ${d.location || 'Unknown'}</div>
            <div style="color:#64748b; font-size:0.82rem;">${d.date}</div>
            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
              <span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:99px;font-size:0.78rem;">▼ ${d.max_depth}m</span>
              <span style="background:#f0fdf4;color:#16a34a;padding:2px 8px;border-radius:99px;font-size:0.78rem;">⏱ ${Math.floor(d.bottom_time ?? 0)}m</span>
              ${d.water_temp != null ? `<span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:99px;font-size:0.78rem;">🌡 ${d.water_temp}°C</span>` : ''}
            </div>
          </div>`,
          { sticky: true }
        );
      markers.push(marker);
    });

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  };
  document.head.appendChild(script);
})();

// =====================
// Chart.js 深度曲線
// =====================
(function initChart(): void {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  script.onload = async function () {
    const dives: Dive[] = window.__DIVES_PROFILE__ || [];
    if (!dives.length) return;

    let profiles: DiveProfiles = {};
    try {
      const r = await fetch('/dive_profiles.json');
      profiles = (await r.json()) as DiveProfiles;
    } catch (_e) {
      // profiles 讀取失敗時保持空物件
    }

    const canvas = document.getElementById('depth-chart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let currentChart: InstanceType<typeof window.Chart> | null = null;

    function renderChart(diveNum: number): void {
      const profile = profiles[String(diveNum)];
      if (!profile?.length) return;

      if (currentChart) currentChart.destroy();

      const hasHr = profile.some((p) => p.hr !== null);

      // 每隔 N 點取樣，避免太多點卡頓
      const step = Math.max(1, Math.floor(profile.length / 300));
      const sampled = profile.filter((_, i) => i % step === 0);

      const isMobile = window.innerWidth < 640;

      currentChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: sampled.map((p) => p.t.toFixed(1)),
          datasets: [
            {
              label: '深度 (m)',
              data: sampled.map((p) => -p.depth),
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56,189,248,0.08)',
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
              labels: { color: '#94a3b8', font: { size: isMobile ? 10 : 12 }, boxWidth: isMobile ? 12 : 40 },
            },
            tooltip: {
              position: 'nearest',
              yAlign: isMobile ? 'bottom' : 'center',
              xAlign: 'center',
              caretPadding: isMobile ? 20 : 4,
              callbacks: {
                label: (ctx) => {
                  if (ctx.dataset.label?.includes('深度')) {
                    return `深度: ${Math.abs(ctx.raw as number).toFixed(1)} m`;
                  }
                  return `心率: ${ctx.raw} bpm`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#475569',
                maxTicksLimit: isMobile ? 4 : 10,
                font: { size: isMobile ? 10 : 12 },
              },
              grid: { color: '#1e2535' },
              title: { display: !isMobile, text: '時間 (分鐘)', color: '#64748b' },
            },
            yDepth: {
              position: 'left',
              ticks: {
                color: '#38bdf8',
                callback: (v) => Math.abs(v as number) + 'm',
                font: { size: isMobile ? 10 : 12 },
                maxTicksLimit: isMobile ? 4 : 8,
              },
              grid: { color: '#1e2535' },
              title: { display: !isMobile, text: '深度', color: '#38bdf8' },
            },
            ...(hasHr
              ? {
                  yHr: {
                    position: 'right',
                    ticks: {
                      color: '#f87171',
                      font: { size: isMobile ? 10 : 12 },
                      maxTicksLimit: isMobile ? 4 : 8,
                    },
                    grid: { drawOnChartArea: false },
                    title: { display: !isMobile, text: 'BPM', color: '#f87171' },
                  },
                }
              : {}),
          },
        },
      });
    }

    // 預設渲染第一個
    if (dives.length) renderChart(dives[0].num);

    // Tab 切換
    document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderChart(parseInt(btn.dataset.dive ?? '0', 10));
      });
    });
  };
  document.head.appendChild(script);
})();
