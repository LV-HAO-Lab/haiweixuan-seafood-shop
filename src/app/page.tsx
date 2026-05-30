import Link from 'next/link'
import { Fish, Shell, Soup, Droplets, ChefHat, Sparkles, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import { CartProvider } from '@/hooks/useCart'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Banner from '@/components/layout/Banner'
import ProductCard from '@/components/product/ProductCard'

const categoryCards = [
  { key: 'SEA_CUCUMBER', icon: Fish, color: 'bg-ocean-500 hover:bg-ocean-600' },
  { key: 'ABALONE', icon: Shell, color: 'bg-amber-500 hover:bg-amber-600' },
  { key: 'BUDDHA_FEAST', icon: Soup, color: 'bg-red-500 hover:bg-red-600' },
  { key: 'FISH_MAW', icon: Droplets, color: 'bg-purple-500 hover:bg-purple-600' },
  { key: 'DUMPLING', icon: ChefHat, color: 'bg-green-500 hover:bg-green-600' },
  { key: 'CUSTOM', icon: Sparkles, color: 'bg-gray-500 hover:bg-gray-600' },
] as const

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { salesCount: 'desc' },
    take: 8,
    include: {
      skus: {
        where: { isDefault: true },
        take: 1,
      },
    },
  })

  return (
    <CartProvider>
      <Navbar />

      <main>
        {/* Banner */}
        <Banner />

        {/* Category Navigation */}
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            商品分类
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryCards.map(({ key, icon: Icon, color }) => (
              <Link
                key={key}
                href={`/products?category=${key}`}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-card p-6 text-white transition-colors',
                  color,
                )}
              >
                <Icon className="h-8 w-8" />
                <span className="text-sm font-medium">
                  {CATEGORY_LABELS[key]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot Products */}
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              热销推荐
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-ocean-700 hover:text-ocean-800 transition-colors"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-sm">暂无商品，敬请期待</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </CartProvider>
  )
}
