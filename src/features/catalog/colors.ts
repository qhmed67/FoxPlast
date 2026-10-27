// Product colour data (not UI palette). Keys come from the catalog `colors` JSON.
export const COLORS: Record<string, { hex: string; label: string }> = {
  yellow: { hex: '#E8C547', label: 'أصفر' },
  orange: { hex: '#F28A1E', label: 'برتقالي' },
  black: { hex: '#1a1a1a', label: 'أسود' },
  red: { hex: '#C62828', label: 'أحمر' },
  pink: { hex: '#E8A0BF', label: 'وردي' },
  blue: { hex: '#2F63B5', label: 'أزرق' },
  green: { hex: '#1F7A3E', label: 'أخضر' },
  white: { hex: '#F5F5F5', label: 'أبيض' },
  natural: { hex: '#D9C9A3', label: 'طبيعي' },
  brown: { hex: '#7A5C2E', label: 'بني' },
  gray: { hex: '#9CA3AF', label: 'رمادي' },
}

export function colorHex(key: string): string {
  return COLORS[key]?.hex ?? '#ccc'
}

export function colorLabel(key: string): string {
  return COLORS[key]?.label ?? key
}
