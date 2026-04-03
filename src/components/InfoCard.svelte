<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte'

  declare global {
    interface Window {
      Chart: any
    }
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

  type SkiEntry = {
    date: string
    country: string
    resort: string
    runs: number
    top_speed_kmh: number
    vertical_m: number
    peak_altitude_m: number
    duration_s: number
  }

  let isOpen = $state(false)
  let cardType: 'dive' | 'ski' | null = $state(null)
  let title = $state('')
  let entryCount = $state('')
  let diveGroup: DiveEntry[] = $state([])
  let skiGroup: SkiEntry[] = $state([])
  let skiSummary = $state({ runs: 0, vert: 0, maxSpeed: 0 })
  let expandedCharts = $state(new Set<number>())

  let profilesCache: Record<string, any[]> = {}
  let chartInstances: Record<string, any> = {}

  function fmtTime(secs: number): string {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return h ? `${h}h ${m}m` : `${m}m`
  }

  function destroyAllCharts() {
    Object.values(chartInstances).forEach((c: any) => c.destroy())
    chartInstances = {}
  }

  function openDive(group: DiveEntry[], profiles: Record<string, any[]>) {
    Object.assign(profilesCache, profiles)
    group.sort((a, b) => b.date.localeCompare(a.date))
    cardType = 'dive'
    title = group[0]?.location ?? 'Unknown'
    entryCount = `${group.length} 次紀錄`
    diveGroup = group
    expandedCharts = new Set()
    destroyAllCharts()
    open()
  }

  function openSki(group: SkiEntry[]) {
    group.sort((a, b) => b.date.localeCompare(a.date))
    cardType = 'ski'
    title = group[0]?.resort?.split('/')[0].trim() ?? ''
    entryCount = `${group.length} 天紀錄`
    skiGroup = group
    skiSummary = {
      runs: group.reduce((s, d) => s + (d.runs || 0), 0),
      vert: group.reduce((s, d) => s + (d.vertical_m || 0), 0),
      maxSpeed: Math.max(...group.map(d => d.top_speed_kmh || 0)),
    }
    destroyAllCharts()
    open()
  }

  function open() {
    isOpen = true
    window.dispatchEvent(new CustomEvent('explore:card-opened'))
  }

  function close() {
    isOpen = false
    destroyAllCharts()
  }

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
    const profile = profilesCache[String(diveNum)]
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

  function handleOpenDive(e: Event) {
    const { group, profiles } = (e as CustomEvent).detail
    openDive(group, profiles)
  }

  function handleOpenSki(e: Event) {
    openSki((e as CustomEvent).detail.group)
  }

  onMount(() => {
    window.addEventListener('explore:open-dive', handleOpenDive)
    window.addEventListener('explore:open-ski', handleOpenSki)
  })

  onDestroy(() => {
    window.removeEventListener('explore:open-dive', handleOpenDive)
    window.removeEventListener('explore:open-ski', handleOpenSki)
    destroyAllCharts()
  })
</script>

<div class="info-card" class:open={isOpen}>
  {#if cardType === 'dive'}
    <div class="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-[#1e2535] bg-[#0d1220ee] backdrop-blur-[8px]">
      <span class="text-[0.72rem] font-bold tracking-[1.5px] uppercase px-[0.6rem] py-[0.2rem] rounded-full bg-[rgba(56,189,248,0.15)] text-accent">🤿 潛水</span>
      <button class="bg-transparent border-none text-[#475569] text-[0.9rem] cursor-pointer px-2 py-1 rounded hover:text-[#94a3b8]" onclick={close}>✕</button>
    </div>
    <div class="text-[1.1rem] font-extrabold text-[#e2e8f0] px-5 pt-4 pb-1 leading-tight">{title}</div>
    <div class="text-[0.72rem] text-[#475569] px-5 pb-3 tracking-[1px] uppercase">{entryCount}</div>
    <div class="px-5 pb-6">
      {#each diveGroup as d, i}
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
          {#if profilesCache[String(d.num)]}
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

  {:else if cardType === 'ski'}
    <div class="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-[#1e2535] bg-[#0d1220ee] backdrop-blur-[8px]">
      <span class="text-[0.72rem] font-bold tracking-[1.5px] uppercase px-[0.6rem] py-[0.2rem] rounded-full bg-[rgba(129,140,248,0.15)] text-indigo">⛷️ 滑雪</span>
      <button class="bg-transparent border-none text-[#475569] text-[0.9rem] cursor-pointer px-2 py-1 rounded hover:text-[#94a3b8]" onclick={close}>✕</button>
    </div>
    <div class="text-[1.1rem] font-extrabold text-[#e2e8f0] px-5 pt-4 pb-1 leading-tight">{title}</div>
    <div class="text-[0.72rem] text-[#475569] px-5 pb-3 tracking-[1px] uppercase">{entryCount}</div>
    <div class="flex border-t border-b border-[#1e2535] mb-2">
      <div class="flex-1 flex flex-col items-center py-3 border-r border-[#1e2535]">
        <span class="text-[1.1rem] font-extrabold text-indigo">{skiSummary.runs}</span>
        <span class="text-[0.6rem] text-[#475569] uppercase tracking-[1px] mt-[2px]">總 runs</span>
      </div>
      <div class="flex-1 flex flex-col items-center py-3 border-r border-[#1e2535]">
        <span class="text-[1.1rem] font-extrabold text-indigo">{(skiSummary.vert / 1000).toFixed(1)}km</span>
        <span class="text-[0.6rem] text-[#475569] uppercase tracking-[1px] mt-[2px]">垂直落差</span>
      </div>
      <div class="flex-1 flex flex-col items-center py-3">
        <span class="text-[1.1rem] font-extrabold text-indigo">{skiSummary.maxSpeed.toFixed(1)}</span>
        <span class="text-[0.6rem] text-[#475569] uppercase tracking-[1px] mt-[2px]">最高速 km/h</span>
      </div>
    </div>
    <div class="px-5 pb-6">
      {#each skiGroup as d, i}
        <div class={`py-3 ${i > 0 ? 'border-t border-[#1e2535]' : ''}`}>
          <div class="flex items-center gap-[0.6rem] mb-[0.4rem]">
            <span class="text-[0.78rem] text-[#64748b]">{d.date}</span>
            <span class="text-[0.72rem] text-[#475569] ml-auto">{d.country}</span>
          </div>
          <div class="flex gap-[0.3rem] flex-wrap">
            <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#1e1a2e] text-indigo">🎿 {d.runs} runs</span>
            <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#2e1a1a] text-red">💨 {d.top_speed_kmh.toFixed(1)}km/h</span>
            <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#0c2d48] text-accent">↕ {(d.vertical_m / 1000).toFixed(2)}km</span>
            <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#1a2e1a] text-green">🏔 {d.peak_altitude_m.toFixed(0)}m</span>
            <span class="px-[0.5rem] py-[0.18rem] rounded-full text-[0.7rem] font-semibold bg-[#1a1a2e] text-indigo">⏱ {fmtTime(d.duration_s)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .info-card {
    position: absolute;
    top: 0;
    right: 0;
    width: 340px;
    height: 100%;
    overflow-y: auto;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .info-card.open {
    transform: translateX(0);
  }

  @media (max-width: 768px) {
    .info-card {
      top: auto;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 60%;
      border-left: none;
      border-top: 1px solid #1e2535;
      border-radius: 1rem 1rem 0 0;
      transform: translateY(100%);
    }

    .info-card.open {
      transform: translateY(0);
    }
  }
</style>
