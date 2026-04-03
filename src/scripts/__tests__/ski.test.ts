import { describe, it, expect } from 'vitest'
import { buildScatterData, aggregateResortRuns, matchSkiRow } from '../lib/ski'

const sample = [
  { resort: 'Hakuba / Goryu', date: '2024-01-10', runs: 12, top_speed_kmh: 82.5, vertical_m: 1200 },
  { resort: 'Hakuba / Happo', date: '2024-01-15', runs: 8,  top_speed_kmh: 75.0, vertical_m: 900 },
  { resort: 'Niseko',         date: '2024-02-01', runs: 15, top_speed_kmh: 90.3, vertical_m: 1500 },
]

describe('buildScatterData', () => {
  it('maps vertical_m to km and rounds to 2 decimals', () => {
    const result = buildScatterData(sample)
    expect(result[0].x).toBe(1.20)
    expect(result[1].x).toBe(0.90)
  })

  it('rounds top_speed_kmh to 1 decimal', () => {
    const result = buildScatterData(sample)
    expect(result[2].y).toBe(90.3)
  })

  it('includes resort and date', () => {
    const result = buildScatterData(sample)
    expect(result[0].resort).toBe('Hakuba / Goryu')
    expect(result[0].date).toBe('2024-01-10')
  })

  it('skips entries missing vertical_m or top_speed_kmh', () => {
    const data = [
      { resort: 'X', date: '2024-01-01', runs: 5, top_speed_kmh: undefined, vertical_m: 1000 },
      { resort: 'Y', date: '2024-01-02', runs: 5, top_speed_kmh: 80,        vertical_m: undefined },
    ]
    expect(buildScatterData(data as any)).toHaveLength(0)
  })
})

describe('aggregateResortRuns', () => {
  it('sums runs per primary resort name', () => {
    const result = aggregateResortRuns(sample)
    const hakuba = result.find(([name]) => name === 'Hakuba')
    expect(hakuba?.[1]).toBe(20) // 12 + 8
  })

  it('sorts by total runs descending', () => {
    const result = aggregateResortRuns(sample)
    expect(result[0][0]).toBe('Hakuba') // 12 + 8 = 20 runs — highest
  })

  it('handles missing runs as 0', () => {
    const data = [{ resort: 'TestResort', date: '2024-01-01' }]
    const result = aggregateResortRuns(data as any)
    expect(result[0][1]).toBe(0)
  })
})

describe('matchSkiRow', () => {
  it('matches when keyword and year are both empty', () => {
    expect(matchSkiRow('Hakuba', '2024-01-10', '', '')).toBe(true)
  })

  it('filters by keyword (case-insensitive)', () => {
    expect(matchSkiRow('Hakuba', '2024-01-10', 'hakuba', '')).toBe(true)
    expect(matchSkiRow('Niseko', '2024-01-10', 'hakuba', '')).toBe(false)
  })

  it('filters by year prefix', () => {
    expect(matchSkiRow('Hakuba', '2024-01-10', '', '2024')).toBe(true)
    expect(matchSkiRow('Hakuba', '2025-01-10', '', '2024')).toBe(false)
  })

  it('requires both conditions to pass', () => {
    expect(matchSkiRow('Hakuba', '2025-01-10', 'hakuba', '2024')).toBe(false)
  })
})
