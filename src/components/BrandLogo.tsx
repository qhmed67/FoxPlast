import { Link } from 'react-router'

// The owner's final mark: a solid fox head, supplied as artwork. The PNG is
// trimmed to its ink and transparent, so it can sit on any background; the
// `paper` tone inverts it for the dark footer without a second file.
const MARK_RATIO = 424 / 512

export function BrandMark({
  size = 40,
  tone = 'ink',
}: {
  size?: number
  tone?: 'ink' | 'paper'
}) {
  return (
    <img
      src="/brand/logo-fox-mark.png"
      alt=""
      width={Math.round(size * MARK_RATIO)}
      height={size}
      decoding="async"
      className={`object-contain ${tone === 'paper' ? 'invert' : ''}`}
      style={{ width: Math.round(size * MARK_RATIO), height: size }}
    />
  )
}

export function BrandLogo() {
  return (
    <Link
      to="/"
      aria-label="Fox Plast — الرئيسية"
      className="flex shrink-0 items-center gap-2"
    >
      <BrandMark />
      <span
        className="text-lg font-bold leading-none text-foreground"
        style={{ fontFamily: 'Readex Pro, sans-serif' }}
      >
        Fox Plast
      </span>
    </Link>
  )
}
