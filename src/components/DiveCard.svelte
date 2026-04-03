<script lang="ts">
  import { onDestroy, tick } from 'svelte'
  import CardHeader from './CardHeader.svelte'

  declare global {
    interface Window { Chart: any }
  }

  type DiveEntry = {
    num: number
    location?: string
    date: string
    max_depth: number
    bottom_time?: number
    water_temp?: number
    gas?: string
    avg_hr?: number
  }

  let { group, profiles, title, entryCount, onClose }: {
    group: DiveEntry[]
    profiles: Record<string, any[]>
    title: string
    entryCount: string
    onClose: () => void
  } = $props()

  let expandedCharts = $state(new Set<number>())
  let chartInstances: Record<string, any> = {}

  function destroyAllCharts() {
    Object.values(chartInstances).forEach((c: any) => c.destroy())
    chartInstances = {}
  }

  onDestroy(destroyAllCharts)

  async function toggleChart(diveNum: number) {
    const next = new Set(expandedCharts)
    if (next.has(diveNum)) {
      next.delete(diveNum)
      const id = `explore-chart-${diveNum}`
      chartInstances[id]?.destroy()
      delete chartInstances[id]
      expandedCharts = next
    } else {
      next.add(diveNum)
      expandedCharts = next
      await tick()
      await buildChart(diveNum)
    }
  }

  async function buildChart(diveNum: number) {
    const canvasId = `explore-chart-${diveNum}`
    if (!window.Chart) {
      await new Promise<void>((resolve) => {
        if (document.querySelector('script[src*="chart.js"]')) { resolve(); return }
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
        s.onload = () => resolve()
        document.head.appendChild(s)
      })
    }
    const profile = profiles[String(diveNum)]
    if (!profile?.length) return
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas) return
    chartInstances[canvasId]?.destroy()
    const step = Math.max(1, Math.floor(profile.length / 200))
    const sampled = profile.filter((_: any, i: number) => i % step === 0)
    chartInstances[canvasId] = new window.Chart(canvas.getContext('2d'), {
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
          y: { ticks: { color: '#38bdf8', callback: (v: any) => `${Math.abs(v)}m`, maxTicksLimit: 5, font: { size: 10 } }, grid: { color: '#1e2535' } },
        },
      },
    })
  }
</script>

<CardHeader emoji="🤿" label="潛水" badgeClass="bg-[rgba(56,189,248,0.15)] text-accent" {title} {entryCount} {onClose} />

<div class="px-5 pb-6">
  {#each group as d, i}
    <div class={`py-3 ${i > 0 ? 'border-t border-[#1e2535]' : ''}`}>
      <div class="flex items-center gap-[0.6rem] mb-[0.4rem]">
        <span class="text-[0.72rem] text-[#475569] font-bold">#{d.num}</span>
        <span class="text-[0.78rem] text-[#64748b]">{d.date}</span>
      </div>
      <div class="flex gap-[0.3rem] flex-wrap">
        <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#0c2d48] text-accent">▼ {d.max_depth}m</span>
        <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#1a1a2e] text-indigo">⏱ {d.bottom_time ? Math.floor(d.bottom_time) + 'm' : '-'}</span>
        {#if d.water_temp != null}
          <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#1a2e1a] text-green">🌡 {d.water_temp}°C</span>
        {/if}
        {#if d.gas && d.gas !== 'Air'}
          <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#2e1a1a] text-red">{d.gas}</span>
        {/if}
        {#if d.avg_hr}
          <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#2e1a1a] text-[#fb7185]">♥ {d.avg_hr}bpm</span>
        {/if}
      </div>
      {#if profiles[String(d.num)]}
        <button
          class="mt-[0.4rem] text-[0.72rem] text-accent bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.2)] rounded-md px-[0.5rem] py-[0.2rem] cursor-pointer hover:bg-[rgba(56,189,248,0.14)]"
          onclick={() => toggleChart(d.num)}
        >
          📈 {expandedCharts.has(d.num) ? '收起曲線' : '深度曲線'}
        </button>
        {#if expandedCharts.has(d.num)}
          <div class="mt-2 relative h-35">
            <canvas id="explore-chart-{d.num}"></canvas>
          </div>
        {/if}
      {/if}
    </div>
  {/each}
</div>
