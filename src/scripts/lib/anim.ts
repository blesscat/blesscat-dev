// Pure animation utilities — no DOM, no side effects

export function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}

export function formatValue(value: number, decimals: number, suffix: string): string {
  return value.toFixed(decimals) + suffix
}
