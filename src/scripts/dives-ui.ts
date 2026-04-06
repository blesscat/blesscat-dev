// dives-ui.ts — stat charts + search/filter for dives page
import { depthLabelColor, monthLabelColors, matchDiveRow } from './lib/dives'

declare global {
  interface Window {
    __DEPTH_CHART_DATA__: { labels: string[]; values: number[] };
    __MONTH_CHART_DATA__: { labels: string[]; values: number[] };
    __TOTAL_DIVES__: number;
    __DIVE_YEAR_DATA__: { labels: string[]; counts: number[]; hours: number[] };
  }
}

const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'

const $ = <T extends Element = Element>(sel: string) =>
  document.querySelector<T>(sel)
const $$ = <T extends HTMLElement = HTMLElement>(sel: string) =>
  document.querySelectorAll<T>(sel)

function getCtx(name: string) {
  return $<HTMLCanvasElement>(`[data-chart="${name}"]`)?.getContext('2d') ?? null
}

function loadChartJS(cb: () => void) {
  if ((window as any).Chart) { cb(); return }
  const s = document.createElement('script')
  s.src = CHART_CDN
  s.onload = cb
  document.head.appendChild(s)
}

// ── 深度分布 + 月份活動 ──────────────────────────────────────────

function initStatCharts() {
  function buildCharts() {
    const depthData = window.__DEPTH_CHART_DATA__
    const monthData = window.__MONTH_CHART_DATA__
    const Chart = (window as any).Chart
    if (!depthData || !monthData || !Chart) return

    const depthCtx = getCtx('depth-dist')
    if (depthCtx) {
      const colors = depthData.labels.map(depthLabelColor)
      new Chart(depthCtx, {
        type: 'bar',
        data: {
          labels: depthData.labels,
          datasets: [{ data: depthData.values, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed.y} 次` } } },
          scales: {
            x: { grid: { color: '#dad4c8' }, ticks: { color: '#9f9b93', font: { size: 12 } } },
            y: { grid: { color: '#dad4c8' }, ticks: { color: '#9f9b93', stepSize: 1 }, beginAtZero: true },
          }
        }
      })
    }

    const monthCtx = getCtx('monthly')
    if (monthCtx) {
      const bgColors = monthLabelColors(monthData.labels)
      new Chart(monthCtx, {
        type: 'bar',
        data: {
          labels: monthData.labels,
          datasets: [{ data: monthData.values, backgroundColor: bgColors, borderRadius: 6, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed.y} 次` } } },
          scales: {
            x: { grid: { color: '#dad4c8' }, ticks: { color: '#9f9b93', font: { size: 11 }, maxRotation: 45 } },
            y: { grid: { color: '#dad4c8' }, ticks: { color: '#9f9b93', stepSize: 1 }, beginAtZero: true },
          }
        }
      })
    }
  }

  const trigger = $('[data-chart="depth-dist"]')
  if (!trigger) return
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadChartJS(buildCharts) }
  }, { rootMargin: '200px' })
  io.observe(trigger)
}

// ── 年度比較圖 ──────────────────────────────────────────────────

function initYearChart() {
  function buildYearChart() {
    const yearData = window.__DIVE_YEAR_DATA__
    const Chart = (window as any).Chart
    if (!yearData || !Chart) return
    const ctx = getCtx('year-compare')
    if (!ctx) return
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: yearData.labels,
        datasets: [
          { label: '潛水次數', data: yearData.counts, backgroundColor: ['#3bd3fd', '#84e7a5', '#4ade80'], borderRadius: 6, borderSkipped: false },
          { label: '總小時數', data: yearData.hours, backgroundColor: ['rgba(59,211,253,0.4)', 'rgba(132,231,165,0.4)', 'rgba(132,231,165,0.4)'], borderRadius: 6, borderSkipped: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: '#9f9b93', font: { size: 12 } } },
          tooltip: { callbacks: { label: (ctx: any) => ctx.datasetIndex === 0 ? ` ${ctx.parsed.y} 次` : ` ${ctx.parsed.y} 小時` } }
        },
        scales: {
          x: { grid: { color: '#dad4c8' }, ticks: { color: '#9f9b93', font: { size: 13 } } },
          y: { grid: { color: '#dad4c8' }, ticks: { color: '#9f9b93' }, beginAtZero: true }
        }
      }
    })
  }

  const canvas = $('[data-chart="year-compare"]')
  if (!canvas) return
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadChartJS(buildYearChart) }
  }, { rootMargin: '200px' })
  io.observe(canvas)
}

// ── 搜尋 + 篩選 ────────────────────────────────────────────────

function initFilter() {
  const searchInput = $<HTMLInputElement>('[data-ref="search"]')
  const yearSelect = $<HTMLSelectElement>('[data-ref="year-select"]')
  const countEl = $<HTMLSpanElement>('[data-ref="count"]')
  const rows = $$('.dive-row')
  const total = window.__TOTAL_DIVES__ || rows.length

  function applyFilter() {
    const keyword = searchInput?.value.trim() ?? ''
    const year = yearSelect?.value ?? ''
    let shown = 0
    rows.forEach(row => {
      const location = row.querySelector('.dive-location')?.textContent || ''
      const date = row.querySelector('.dive-date')?.textContent || ''
      const match = matchDiveRow(location, date, keyword, year)
      row.style.display = match ? '' : 'none'
      if (match) shown++
    })
    if (countEl) countEl.textContent = `顯示 ${shown} / ${total} 筆`
  }

  searchInput?.addEventListener('input', applyFilter)
  yearSelect?.addEventListener('change', applyFilter)
}

initStatCharts()
initYearChart()
initFilter()

export {}
