// Money is stored as integer piasters (قروش). Never floats. Western digits only.
export function piastersToPounds(piasters: number): number {
  return piasters / 100
}

export function formatMoney(piasters: number): string {
  const pounds = piasters / 100
  const num = Number.isInteger(pounds) ? pounds.toString() : pounds.toFixed(2)
  return `${num} ج.م`
}

export function ceilDeposit(subtotalPiasters: number, percent: number): number {
  return Math.ceil((subtotalPiasters * percent) / 100)
}

export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100)
}
