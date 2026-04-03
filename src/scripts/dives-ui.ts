// dives-ui.ts — stat charts + search/filter for dives page

const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';

function loadChartJS(cb: () => void) {
  if ((window as any).Chart) { cb(); return; }
  const s = document.createElement('script');
  s.src = CHART_CDN;
  s.onload = cb;
  document.head.appendChild(s);
}

// ── 深度分布 + 月份活動 ──────────────────────────────────────────

(function initStatCharts() {
  function buildCharts() {
    const depthData = (window as any).__DEPTH_CHART_DATA__;
    const monthData = (window as any).__MONTH_CHART_DATA__;
    const Chart = (window as any).Chart;
    if (!depthData || !monthData || !Chart) return;

    const depthCanvas = document.getElementById('depth-dist-chart') as HTMLCanvasElement;
    if (depthCanvas) {
      const colors = depthData.labels.map((l: string) =>
        l === '30m+' ? '#f87171' : '#38bdf8'
      );
      new Chart(depthCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: depthData.labels,
          datasets: [{ data: depthData.values, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed.y} 次` } } },
          scales: {
            x: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8', font: { size: 12 } } },
            y: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8', stepSize: 1 }, beginAtZero: true },
          }
        }
      });
    }

    const monthCanvas = document.getElementById('monthly-chart') as HTMLCanvasElement;
    if (monthCanvas) {
      const yearColors: Record<string, string> = { '2024': '#38bdf8', '2025': '#818cf8', '2026': '#4ade80' };
      const bgColors = monthData.labels.map((ym: string) => yearColors[ym.slice(0, 4)] || '#38bdf8');
      new Chart(monthCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: monthData.labels,
          datasets: [{ data: monthData.values, backgroundColor: bgColors, borderRadius: 6, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed.y} 次` } } },
          scales: {
            x: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8', font: { size: 11 }, maxRotation: 45 } },
            y: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8', stepSize: 1 }, beginAtZero: true },
          }
        }
      });
    }
  }

  const trigger = document.querySelector('#depth-dist-chart');
  if (!trigger) return;
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadChartJS(buildCharts); }
  }, { rootMargin: '200px' });
  io.observe(trigger);
})();

// ── 年度比較圖 ──────────────────────────────────────────────────

(function initYearChart() {
  function buildYearChart() {
    const yearData = (window as any).__DIVE_YEAR_DATA__;
    const Chart = (window as any).Chart;
    if (!yearData || !Chart) return;
    const canvas = document.getElementById('year-compare-chart') as HTMLCanvasElement;
    if (!canvas) return;
    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: yearData.labels,
        datasets: [
          { label: '潛水次數', data: yearData.counts, backgroundColor: ['#38bdf8', '#818cf8', '#4ade80'], borderRadius: 6, borderSkipped: false },
          { label: '總小時數', data: yearData.hours, backgroundColor: ['rgba(56,189,248,0.4)', 'rgba(129,140,248,0.4)', 'rgba(74,222,128,0.4)'], borderRadius: 6, borderSkipped: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#94a3b8', font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx: any) => ctx.datasetIndex === 0 ? ` ${ctx.parsed.y} 次` : ` ${ctx.parsed.y} 小時` } }
        },
        scales: {
          x: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8', font: { size: 13 } } },
          y: { grid: { color: '#1e2535' }, ticks: { color: '#94a3b8' }, beginAtZero: true }
        }
      }
    });
  }

  const canvas = document.querySelector('#year-compare-chart');
  if (!canvas) return;
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadChartJS(buildYearChart); }
  }, { rootMargin: '200px' });
  io.observe(canvas);
})();

// ── 搜尋 + 篩選 ────────────────────────────────────────────────

(function initFilter() {
  const searchInput = document.getElementById('dive-search') as HTMLInputElement;
  const yearSelect = document.getElementById('year-filter') as HTMLSelectElement;
  const countEl = document.getElementById('filter-count') as HTMLSpanElement;
  const rows = document.querySelectorAll<HTMLElement>('.dive-row');
  const total = (window as any).__TOTAL_DIVES__ || rows.length;

  function applyFilter() {
    const keyword = searchInput.value.trim().toLowerCase();
    const year = yearSelect.value;
    let shown = 0;
    rows.forEach(row => {
      const location = (row.querySelector('.dive-location')?.textContent || '').toLowerCase();
      const date = row.querySelector('.dive-date')?.textContent || '';
      const matchKeyword = !keyword || location.includes(keyword);
      const matchYear = !year || date.slice(0, 4) === year;
      row.style.display = (matchKeyword && matchYear) ? '' : 'none';
      if (matchKeyword && matchYear) shown++;
    });
    if (countEl) countEl.textContent = `顯示 ${shown} / ${total} 筆`;
  }

  searchInput?.addEventListener('input', applyFilter);
  yearSelect?.addEventListener('change', applyFilter);
})();
