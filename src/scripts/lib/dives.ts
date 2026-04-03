// Pure data-transformation utilities for dive pages

export interface ProfilePoint {
  t: number
  depth: number
  hr: number | null
}

/** Samples a profile array by taking every Nth point to stay under maxPoints. */
export function sampleProfile(profile: ProfilePoint[], maxPoints: number): ProfilePoint[] {
  const step = Math.max(1, Math.floor(profile.length / maxPoints))
  return profile.filter((_, i) => i % step === 0)
}

/** Returns the bar color for a depth-bucket label. */
export function depthLabelColor(label: string): string {
  return label === '30m+' ? '#f87171' : '#38bdf8'
}

const YEAR_COLORS: Record<string, string> = {
  '2024': '#38bdf8',
  '2025': '#818cf8',
  '2026': '#4ade80',
}

/** Maps an array of 'YYYY-MM' labels to their bar colors. */
export function monthLabelColors(labels: string[]): string[] {
  return labels.map(ym => YEAR_COLORS[ym.slice(0, 4)] ?? '#38bdf8')
}

/** Returns true when a dive row matches the given keyword and year filter. */
export function matchDiveRow(location: string, date: string, keyword: string, year: string): boolean {
  const matchKeyword = !keyword || location.toLowerCase().includes(keyword.toLowerCase())
  const matchYear = !year || date.slice(0, 4) === year
  return matchKeyword && matchYear
}
