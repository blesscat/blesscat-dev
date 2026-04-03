<script lang="ts">
  import CardHeader from './CardHeader.svelte'

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

  let { group, summary, title, entryCount, onClose }: {
    group: SkiEntry[]
    summary: { runs: number; vert: number; maxSpeed: number }
    title: string
    entryCount: string
    onClose: () => void
  } = $props()

  function fmtTime(secs: number): string {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return h ? `${h}h ${m}m` : `${m}m`
  }
</script>

<CardHeader emoji="⛷️" label="滑雪" badgeClass="bg-[rgba(129,140,248,0.15)] text-indigo" {title} {entryCount} {onClose} />

<div class="flex border-t border-b border-[#1e2535] mb-2">
  <div class="flex-1 flex flex-col items-center py-3 border-r border-[#1e2535]">
    <span class="text-[1.1rem] font-extrabold text-indigo">{summary.runs}</span>
    <span class="text-[0.6rem] text-[#475569] uppercase tracking-[1px] mt-[2px]">總 runs</span>
  </div>
  <div class="flex-1 flex flex-col items-center py-3 border-r border-[#1e2535]">
    <span class="text-[1.1rem] font-extrabold text-indigo">{(summary.vert / 1000).toFixed(1)}km</span>
    <span class="text-[0.6rem] text-[#475569] uppercase tracking-[1px] mt-[2px]">垂直落差</span>
  </div>
  <div class="flex-1 flex flex-col items-center py-3">
    <span class="text-[1.1rem] font-extrabold text-indigo">{summary.maxSpeed.toFixed(1)}</span>
    <span class="text-[0.6rem] text-[#475569] uppercase tracking-[1px] mt-[2px]">最高速 km/h</span>
  </div>
</div>

<div class="px-5 pb-6">
  {#each group as d, i}
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
