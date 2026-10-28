const GLYPH_COLORS: Record<string, string> = {
  yellow: '#D8A207',
  orange: '#D9710A',
  black: '#1A1A1A',
  red: '#B3261E',
  pink: '#C95A82',
  blue: '#1D3F7B',
  green: '#1F7A3E',
  white: '#E9E3D8',
  natural: '#C9AD7C',
  brown: '#7A4A2A',
  gray: '#6F6F6F',
}

/** Drawn bag used when a product has no real photograph yet. */
export function BagGlyph({ color, className }: { color?: string; className?: string }) {
  const fill = GLYPH_COLORS[color ?? 'blue'] ?? '#1D3F7B'
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label="رسم توضيحي لشنطة"
    >
      <path
        d="M58 78c0-30 16-47 42-47s42 17 42 47"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M30 78h140l10 114H20L30 78Z" fill={fill} />
      <path d="M30 78h140l2 22H28l2-22Z" fill="#000" opacity=".16" />
      <path
        d="M72 78c0 18 12 30 28 30s28-12 28-30"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M20 178h160l-2 14H22l-2-14Z" fill="#000" opacity=".14" />
    </svg>
  )
}
