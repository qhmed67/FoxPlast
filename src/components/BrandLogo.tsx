import { Link } from 'react-router'

// TODO(asset): replace the square fox-mark with `logo-horizontal.png`
// (fox head + navy "FOX" + orange "PLAST") when the owner supplies it.
// Until then the supplied mark sits on a light chip, per DESIGN.md §9.
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/brand/logo-fox-mark.png"
      alt=""
      width={size}
      height={size}
      decoding="async"
      className="rounded-full bg-kraft-50 object-cover ring-1 ring-border"
      style={{ width: size, height: size }}
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
