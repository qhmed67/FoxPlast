// Egypt mobile: 01[0125]XXXXXXXX. Western digits only in storage/display.
const ARABIC_INDIC = /[٠-٩]/g

export function toWesternDigits(input: string): string {
  return input.replace(ARABIC_INDIC, (d) => String(d.charCodeAt(0) - 0x0660))
}

export function normalizePhone(input: string): string | null {
  let s = toWesternDigits(input).replace(/[\s-]/g, '')
  if (s.startsWith('+20')) s = '0' + s.slice(3)
  if (s.startsWith('0020')) s = '0' + s.slice(4)
  if (!/^01[0125][0-9]{8}$/.test(s)) return null
  return s
}

export function isEgyptMobile(input: string): boolean {
  return normalizePhone(input) !== null
}
