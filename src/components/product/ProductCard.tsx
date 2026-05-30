import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/types'
import { cn, formatPrice, getImages } from '@/lib/utils'

interface ProductCardProduct {
  id: string
  name: string
  category: string
  images: string[]
  basePrice: { toString(): string } | number | string
  salesCount: number
  skus: { price: { toString(): string } | number | string }[]
}

interface ProductCardProps {
  product: ProductCardProduct
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const price = product.skus?.[0]?.price ?? product.basePrice
  const imageUrl = getImages(product.images)[0]

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        'group block rounded-card border border-gray-100 bg-white overflow-hidden transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* Product image */}
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl md:text-6xl">🦪</span>
        )}
      </div>

      {/* Product info */}
      <div className="p-3 md:p-4">
        {/* Category badge */}
        <Badge variant="info" className="mb-2">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </Badge>

        {/* Product name */}
        <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-1 mb-2">
          {product.name}
        </h3>

        {/* Price and sales */}
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg font-bold text-accent">
            {formatPrice(Number(price))}
          </span>
          <span className="text-xs text-gray-400">
            已售 {product.salesCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
