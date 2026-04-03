<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import DiveCard from './DiveCard.svelte'
  import SkiCard from './SkiCard.svelte'

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
  let cardKey = $state(0)
  let cardType: 'dive' | 'ski' | null = $state(null)
  let title = $state('')
  let entryCount = $state('')
  let diveGroup: DiveEntry[] = $state([])
  let skiGroup: SkiEntry[] = $state([])
  let skiSummary = $state({ runs: 0, vert: 0, maxSpeed: 0 })
  let profilesCache: Record<string, any[]> = {}

  // transform classes: desktop slides right, mobile slides up
  const slideIn  = 'translate-x-0 max-[768px]:translate-y-0'
  const slideOut = 'translate-x-full max-[768px]:translate-x-0 max-[768px]:translate-y-full'
  const transformClass = $derived(isOpen ? slideIn : slideOut)

  function openDive(group: DiveEntry[], profiles: Record<string, any[]>) {
    Object.assign(profilesCache, profiles)
    group.sort((a, b) => b.date.localeCompare(a.date))
    cardType = 'dive'
    title = group[0]?.location ?? 'Unknown'
    entryCount = `${group.length} 次紀錄`
    diveGroup = group
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
    open()
  }

  function open() {
    isOpen = true
    cardKey++
    window.dispatchEvent(new CustomEvent('explore:card-opened'))
  }

  function close() {
    isOpen = false
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
  })
</script>

<div class="absolute top-0 right-0 w-[340px] h-full overflow-y-auto z-[1000]
            bg-surface2-alpha backdrop-blur-[12px] border-l border-border
            transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
            max-[768px]:top-auto max-[768px]:bottom-0 max-[768px]:w-full max-[768px]:h-[60%]
            max-[768px]:border-l-0 max-[768px]:border-t max-[768px]:rounded-t-2xl
            {transformClass}">
  {#key cardKey}
    {#if cardType === 'dive'}
      <DiveCard group={diveGroup} profiles={profilesCache} {title} {entryCount} onClose={close} />
    {:else if cardType === 'ski'}
      <SkiCard group={skiGroup} summary={skiSummary} {title} {entryCount} onClose={close} />
    {/if}
  {/key}
</div>
