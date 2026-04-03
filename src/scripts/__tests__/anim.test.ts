import { describe, it, expect } from 'vitest'
import { easeOutCubic, formatValue } from '../lib/anim'

describe('easeOutCubic', () => {
  it('returns 0 at progress 0', () => {
    expect(easeOutCubic(0)).toBe(0)
  })

  it('returns 1 at progress 1', () => {
    expect(easeOutCubic(1)).toBe(1)
  })

  it('is greater than linear at mid-progress (ease-out accelerates early)', () => {
    const linear = 0.5
    expect(easeOutCubic(0.5)).toBeGreaterThan(linear)
  })

  it('stays within [0, 1] for inputs in [0, 1]', () => {
    for (let p = 0; p <= 1; p += 0.1) {
      const v = easeOutCubic(p)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

describe('formatValue', () => {
  it('formats integer with no decimals and no suffix', () => {
    expect(formatValue(42, 0, '')).toBe('42')
  })

  it('rounds to given decimals', () => {
    expect(formatValue(3.14159, 2, '')).toBe('3.14')
  })

  it('appends suffix', () => {
    expect(formatValue(100, 0, 'm')).toBe('100m')
  })

  it('handles zero', () => {
    expect(formatValue(0, 1, '%')).toBe('0.0%')
  })
})
