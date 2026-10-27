import { formatMoney } from '../lib/money'

/**
 * Money is always Western digits + tabular mono, isolated so RTL text around it
 * cannot reorder the number and currency. See DESIGN.md §3.
 */
export function Money({ piasters, className = '' }: { piasters: number; className?: string }) {
  return (
    <span className={`font-mono [unicode-bidi:isolate] ${className}`} dir="ltr">
      {formatMoney(piasters)}
    </span>
  )
}
