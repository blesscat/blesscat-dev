// Pure data-transformation utilities for ski pages

export interface SkiRow {
  resort: string
  date: string
  runs?: number
  top_speed_kmh?: number
  vertical_m?: number
}

export interface ScatterPoint {
  x: number
  y: number
  resort: string
  date: string
}

/** Builds scatter-plot data: vertical (km) vs top speed (km/h). */
export function buildScatterData(data: SkiRow[]): ScatterPoint[] {
  return data
    .filter(d => d.vertical_m != null && d.top_speed_kmh != null)
    .map(d => ({
      x: parseFloat((d.vertical_m! / 1000).toFixed(2)),
      y: parseFloat(d.top_speed_kmh!.toFixed(1)),
      resort: d.resort,
      date: d.date,
    }))
}

/** Aggregates total runs per resort (uses primary name before '/'). */
export function aggregateResortRuns(data: SkiRow[]): [string, number][] {
  const totals: Record<string, number> = {}
  data.forEach(d => {
    const name = d.resort.split('/')[0].trim()
    totals[name] = (totals[name] || 0) + (d.runs || 0)
  })
  return Object.entries(totals).sort((a, b) => b[1] - a[1])
}

/** Returns true when a row matches the given search keyword and year filter. */
export function matchSkiRow(resort: string, date: string, keyword: string, year: string): boolean {
  const matchKeyword = !keyword || resort.toLowerCase().includes(keyword.toLowerCase())
  const matchYear = !year || date.startsWith(year)
  return matchKeyword && matchYear
}
