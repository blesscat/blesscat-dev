import { describe, it, expect } from 'vitest'
import { getYear, groupDivesByLocation, groupSkiByResort, countCountries } from '../lib/explore'

describe('getYear', () => {
  it('parses year from ISO date string', () => {
    expect(getYear('2024-03-15')).toBe(2024)
  })

  it('parses year from compact date', () => {
    expect(getYear('20251220')).toBe(2025)
  })
})

describe('groupDivesByLocation', () => {
  const dives = [
    { date: '2024-01-01', lat: 25.123100, lon: 121.654200 }, // rounds to 25.123 / 121.654
    { date: '2024-02-01', lat: 25.123400, lon: 121.654100 }, // same bucket: 25.123 / 121.654
    { date: '2024-03-01', lat: 22.000000, lon: 114.000000 },
    { date: '2024-04-01', lat: null, lon: null },             // skipped
  ]

  it('groups entries with the same rounded location', () => {
    const groups = groupDivesByLocation(dives)
    expect(Object.keys(groups)).toHaveLength(2)
  })

  it('skips entries without coordinates', () => {
    const groups = groupDivesByLocation(dives)
    const allEntries = Object.values(groups).flat()
    expect(allEntries).toHaveLength(3)
  })

  it('uses 3-decimal lat/lon key', () => {
    const groups = groupDivesByLocation(dives)
    expect(groups['25.123_121.654']).toHaveLength(2)
  })
})

describe('groupSkiByResort', () => {
  const ski = [
    { date: '2024-01-10', resort: 'Hakuba / Goryu', lat: 36.7, lon: 137.8 },
    { date: '2024-01-15', resort: 'Hakuba / Happo', lat: 36.7, lon: 137.8 },
    { date: '2024-02-01', resort: 'Niseko', lat: 42.8, lon: 140.7 },
    { date: '2024-03-01', resort: 'Lost Resort', lat: null, lon: null }, // skipped
  ]

  it('groups by primary resort name (before /)', () => {
    const groups = groupSkiByResort(ski)
    expect(Object.keys(groups)).toHaveLength(2)
    expect(groups['Hakuba']).toHaveLength(2)
    expect(groups['Niseko']).toHaveLength(1)
  })

  it('skips entries without coordinates', () => {
    const groups = groupSkiByResort(ski)
    const allEntries = Object.values(groups).flat()
    expect(allEntries).toHaveLength(3)
  })
})

describe('countCountries', () => {
  it('counts unique countries across dives and ski', () => {
    const dives = [
      { date: '2024-01-01', location: 'Kenting, Taiwan' },
      { date: '2024-02-01', location: 'Okinawa, Japan' },
    ]
    const ski = [
      { date: '2024-01-10', resort: 'Hakuba', country: 'Japan' },
      { date: '2024-01-15', resort: 'Niseko', country: 'Japan' },
    ]
    // Taiwan + Japan = 2 unique
    expect(countCountries(dives, ski)).toBe(2)
  })

  it('filters out empty country strings', () => {
    const dives = [{ date: '2024-01-01', location: '' }]
    const ski = [{ date: '2024-01-10', resort: 'X', country: 'Japan' }]
    expect(countCountries(dives, ski)).toBe(1)
  })
})
