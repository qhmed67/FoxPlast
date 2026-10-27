import { formatMoney } from '../lib/money'

/**
 * Money is Western digits + tabular mono. It inherits the RTL base so the number
 * sits to the right of the "ج.م" suffix, which is how Arabic reads it. Isolated so
 * surrounding text cannot reorder the pair. See DESIGN.md §3.
 */
export function Money({ piasters, className = '' }: { piasters: number; className?: string }) {
  return (
    <span className={`font-mono [unicode-bidi:isolate] ${className}`}>
      {formatMoney(piasters)}
    </span>
  )
}
