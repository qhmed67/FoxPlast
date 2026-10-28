import { Link } from 'react-router'
import { Money } from './Money'
import { BagGlyph } from './productImages'
import { productGlyphColor, productImage } from './productMedia'
import { colorHex, colorLabel } from '../features/catalog/colors'
import type { Product } from '../features/catalog/types'

type ProductCardProps = {
  product: Product
  imageColor?: string
  title?: string
  href?: string
  eager?: boolean
}

export function ProductCard({ product, imageColor, title, href, eager }: ProductCardProps) {
  const image = productImage(product.slug, imageColor)
  const fromPrice = product.tiers.at(-1)?.unitPricePiasters
  const target = href ?? `/product/${product.slug}`

  return (
    <li className="group">
      <Link to={target} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#EFEAE1]">
          {image ? (
            <img
              src={image}
              alt={title ?? product.name}
              loading={eager ? 'eager' : 'lazy'}
              className="h-full w-full object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BagGlyph
                color={productGlyphColor(product)}
                className="h-[62%] w-auto drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
          )}
          <span className="absolute start-3 top-3 bg-coal px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone">
            {product.category === 'storage' ? 'خزين' : 'دعاية'}
          </span>
        </div>

        <div className="mt-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-coal">
            {title ?? product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-kraft-700">{product.material}</p>
            {fromPrice !== undefined && (
              <p className="shrink-0 text-xs text-coal">
                من <Money piasters={fromPrice} />
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {product.colors.slice(0, 6).map((c) => (
            <span
              key={c}
              title={colorLabel(c)}
              className="h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: colorHex(c) }}
            />
          ))}
        </div>
      </Link>
    </li>
  )
}
