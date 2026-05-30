import ProductCard from './ProductCard'

interface ProductGridProduct {
  id: string
  name: string
  category: string
  images: string[]
  basePrice: { toString(): string } | number | string
  salesCount: number
  skus: { price: { toString(): string } | number | string }[]
}

interface ProductGridProps {
  products: ProductGridProduct[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-sm">没有找到相关商品</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
