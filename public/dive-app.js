
// =====================
// Leaflet 地圖
// =====================
(function initMap() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function() {
    const map = L.map('dive-map', { zoomControl: true });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    const dives = window.__DIVES_GPS__ || [];
    if (!dives.length) return;

    // 自訂 marker icon
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

    const markers = [];
    dives.forEach(d => {
      const marker = L.marker([d.lat, d.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif; color:#0f172a; min-width:160px;">
            <div style="font-weight:700; font-size:1rem; margin-bottom:4px;">#${d.num} ${d.location || 'Unknown'}</div>
            <div style="color:#64748b; font-size:0.82rem;">${d.date}</div>
            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
              <span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:99px;font-size:0.78rem;">▼ ${d.max_depth}m</span>
              <span style="background:#f0fdf4;color:#16a34a;padding:2px 8px;border-radius:99px;font-size:0.78rem;">⏱ ${Math.floor(d.bottom_time||0)}m</span>
              ${d.water_temp ? `<span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:99px;font-size:0.78rem;">🌡 ${d.water_temp}°C</span>` : ''}
            </div>
          </div>
        `);
      markers.push(marker);
    });

    // 自動 fit bounds
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  };
  document.head.appendChild(script);
})();

// =====================
// Chart.js 深度曲線
// =====================
(function initChart() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  script.onload = async function() {
    const dives = window.__DIVES_PROFILE__ || [];
    if (!dives.length) return;

    // 載入所有 profiles
    const res = await fetch('/src/data/dive_profiles.json').catch(() => null);
    // 改用 inline data
    let profiles = {};
    try {
      const r = await fetch('/dive_profiles.json');
      profiles = await r.json();
    } catch(e) {}

    const canvas = document.getElementById('depth-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentChart = null;

    function renderChart(diveNum) {
      const profile = profiles[String(diveNum)];
      if (!profile || !profile.length) return;

      if (currentChart) currentChart.destroy();

      const labels = profile.map(p => p.t.toFixed(1));
      const depths = profile.map(p => -p.depth); // 負值讓深度向下
      const hrs = profile.map(p => p.hr);
      const hasHr = hrs.some(h => h !== null);

      const datasets = [
        {
          label: '深度 (m)',
          data: depths,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
          yAxisID: 'yDepth',
        }
      ];

      if (hasHr) {
        datasets.push({
          label: '心率 (bpm)',
          data: hrs,
          borderColor: '#f87171',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1.5,
          yAxisID: 'yHr',
        });
      }

      // 每隔 N 點取樣，避免太多點卡頓
      const step = Math.max(1, Math.floor(profile.length / 300));
      const sampled = profile.filter((_, i) => i % step === 0);

      currentChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sampled.map(p => p.t.toFixed(1)),
          datasets: [
            {
              label: '深度 (m)',
              data: sampled.map(p => -p.depth),
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56,189,248,0.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 2,
              yAxisID: 'yDepth',
            },
            ...(hasHr ? [{
              label: '心率 (bpm)',
              data: sampled.map(p => p.hr),
              borderColor: '#f87171',
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.4,
              pointRadius: 0,
              borderWidth: 1.5,
              yAxisID: 'yHr',
            }] : [])
          ]
        },
        options: {
          responsive: true,
          animation: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: { color: '#94a3b8', font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: ctx => {
                  if (ctx.dataset.label.includes('深度')) return `深度: ${Math.abs(ctx.raw).toFixed(1)} m`;
                  return `心率: ${ctx.raw} bpm`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: '#475569', maxTicksLimit: 10 },
              grid: { color: '#1e2535' },
              title: { display: true, text: '時間 (分鐘)', color: '#64748b' }
            },
            yDepth: {
              position: 'left',
              ticks: {
                color: '#38bdf8',
                callback: v => Math.abs(v) + 'm'
              },
              grid: { color: '#1e2535' },
              title: { display: true, text: '深度', color: '#38bdf8' }
            },
            ...(hasHr ? {
              yHr: {
                position: 'right',
                ticks: { color: '#f87171' },
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'BPM', color: '#f87171' }
              }
            } : {})
          }
        }
      });
    }

    // 預設渲染第一個
    if (dives.length) renderChart(dives[0].num);

    // Tab 切換
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderChart(parseInt(btn.dataset.dive));
      });
    });
  };
  document.head.appendChild(script);
})();
