import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getImages } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import AddToCartButton from './AddToCartButton'
import ReviewSection from './ReviewSection'

interface ProductPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isPublished: true },
    select: { name: true },
  })

  if (!product) return { title: '商品不存在' }

  return {
    title: product.name,
    description: `查看 ${product.name} 的详情、规格和用户评价`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      skus: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!product) {
    notFound()
  }

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0

  const reviewCount = product.reviews.length

  // Serialize product for client component: convert Decimal to number
  const clientProduct = {
    id: product.id,
    name: product.name,
    images: getImages(product.images),
    skus: product.skus.map((sku) => ({
      id: sku.id,
      sku: sku.sku,
      price: Number(sku.price),
      stock: sku.stock,
      isDefault: sku.isDefault,
    })),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: Image area */}
        <div className="bg-gradient-to-br from-ocean-50 to-amber-50 rounded-card h-80 md:h-96 flex items-center justify-center overflow-hidden">
          {getImages(product.images)[0] ? (
            <img
              src={getImages(product.images)[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-6xl md:text-7xl">🦪</span>
          )}
        </div>

        {/* RIGHT: Product info */}
        <div className="space-y-4">
          {/* Category badge */}
          <Badge variant="info">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </Badge>

          {/* Product name */}
          <h1 className="text-2xl font-bold text-gray-800">
            {product.name}
          </h1>

          {/* Star rating + reviews + sales */}
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-1 text-gray-600">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span>{reviewCount} 条评价</span>
            <span className="text-gray-300">|</span>
            <span>已售 {product.salesCount}</span>
          </div>

          {/* Price */}
          <p className="text-3xl font-bold text-accent">
            {formatPrice(Number(product.basePrice))}
          </p>

          {/* Add to cart button with SKU selection */}
          <AddToCartButton product={clientProduct} />

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                商品描述
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review section */}
      <ReviewSection
        productId={product.id}
        initialReviews={product.reviews}
      />
    </div>
  )
}
