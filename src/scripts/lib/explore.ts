// Pure data-transformation utilities for the explore map

export interface DiveEntry {
  date: string
  lat?: number | null
  lon?: number | null
  location?: string
}

export interface SkiEntry {
  date: string
  resort: string
  lat?: number | null
  lon?: number | null
  country?: string
}

export function getYear(dateStr: string): number {
  return parseInt(dateStr.slice(0, 4), 10)
}

/** Groups dive entries by rounded lat/lon key (3 decimal places). */
export function groupDivesByLocation(dives: DiveEntry[]): Record<string, DiveEntry[]> {
  const groups: Record<string, DiveEntry[]> = {}
  dives.forEach(d => {
    if (d.lat == null || d.lon == null) return
    const key = `${(+d.lat).toFixed(3)}_${(+d.lon).toFixed(3)}`
    if (!groups[key]) groups[key] = []
    groups[key].push(d)
  })
  return groups
}

/** Groups ski entries by the primary resort name (before the first '/') */
export function groupSkiByResort(ski: SkiEntry[]): Record<string, SkiEntry[]> {
  const groups: Record<string, SkiEntry[]> = {}
  ski.forEach(d => {
    if (d.lat == null || d.lon == null) return
    const key = d.resort.split('/')[0].trim()
    if (!groups[key]) groups[key] = []
    groups[key].push(d)
  })
  return groups
}

/** Extracts unique country count from filtered dives + ski entries. */
export function countCountries(dives: DiveEntry[], ski: SkiEntry[]): number {
  const countries = new Set([
    ...dives.map(d => (d.location || '').split(', ').pop() || ''),
    ...ski.map(d => d.country || ''),
  ].filter(Boolean))
  return countries.size
}
