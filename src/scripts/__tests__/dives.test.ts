import { describe, it, expect } from 'vitest'
import { sampleProfile, depthLabelColor, monthLabelColors, matchDiveRow } from '../lib/dives'

describe('sampleProfile', () => {
  const profile = Array.from({ length: 600 }, (_, i) => ({ t: i * 0.1, depth: i * 0.05, hr: null }))

  it('reduces a large profile to at most maxPoints entries', () => {
    const result = sampleProfile(profile, 300)
    expect(result.length).toBeLessThanOrEqual(300)
  })

  it('returns the full array when shorter than maxPoints', () => {
    const short = [{ t: 0, depth: 5, hr: 70 }, { t: 1, depth: 10, hr: 72 }]
    const result = sampleProfile(short, 300)
    expect(result).toHaveLength(2)
  })

  it('always includes the first point', () => {
    const result = sampleProfile(profile, 300)
    expect(result[0]).toEqual(profile[0])
  })
})

describe('depthLabelColor', () => {
  it('returns red for 30m+ label', () => {
    expect(depthLabelColor('30m+')).toBe('#f87171')
  })

  it('returns accent blue for any other label', () => {
    expect(depthLabelColor('0–10m')).toBe('#38bdf8')
    expect(depthLabelColor('10–20m')).toBe('#38bdf8')
    expect(depthLabelColor('20–30m')).toBe('#38bdf8')
  })
})

describe('monthLabelColors', () => {
  it('maps years to their designated colors', () => {
    const labels = ['2024-03', '2025-01', '2026-06']
    const colors = monthLabelColors(labels)
    expect(colors).toEqual(['#38bdf8', '#818cf8', '#4ade80'])
  })

  it('falls back to accent blue for unknown years', () => {
    const colors = monthLabelColors(['2099-01'])
    expect(colors).toEqual(['#38bdf8'])
  })
})

describe('matchDiveRow', () => {
  it('matches when both keyword and year are empty', () => {
    expect(matchDiveRow('Kenting, Taiwan', '2024-03-15', '', '')).toBe(true)
  })

  it('filters by keyword in location (case-insensitive)', () => {
    expect(matchDiveRow('Kenting, Taiwan', '2024-03-15', 'kenting', '')).toBe(true)
    expect(matchDiveRow('Okinawa, Japan', '2024-03-15', 'kenting', '')).toBe(false)
  })

  it('filters by year prefix of date', () => {
    expect(matchDiveRow('Kenting', '2024-03-15', '', '2024')).toBe(true)
    expect(matchDiveRow('Kenting', '2025-01-10', '', '2024')).toBe(false)
  })

  it('requires both conditions to pass', () => {
    expect(matchDiveRow('Kenting', '2025-03-15', 'kenting', '2024')).toBe(false)
  })
})
