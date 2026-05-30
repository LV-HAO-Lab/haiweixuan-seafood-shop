import ProductFilter from '@/components/product/ProductFilter'
import ProductSearch from '@/components/product/ProductSearch'
import ProductGrid from '@/components/product/ProductGrid'
import Link from 'next/link'
import { Suspense } from 'react'

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const category =
    typeof searchParams.category === 'string' ? searchParams.category : ''
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : ''
  const sort =
    typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'
  const page =
    typeof searchParams.page === 'string'
      ? parseInt(searchParams.page)
      : 1

  // Build query string for the internal API call
  const apiParams = new URLSearchParams()
  if (category) apiParams.set('category', category)
  if (search) apiParams.set('search', search)
  if (sort && sort !== 'newest') apiParams.set('sort', sort)
  apiParams.set('page', String(page))
  apiParams.set('limit', '12')

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/products?${apiParams.toString()}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
        加载商品失败，请稍后重试。
      </div>
    )
  }

  const data = await res.json()
  const products = data.products ?? []
  const totalPages = data.totalPages ?? 1

  // Generate page numbers array for pagination
  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  // Build query string for pagination / navigation links
  const pageQuery = (p: number): string => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (sort && sort !== 'newest') params.set('sort', sort)
    if (p > 1) params.set('page', String(p))
    const q = params.toString()
    return q ? `?${q}` : ''
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">全部商品</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filter */}
        <aside className="lg:w-56 shrink-0">
          <ProductFilter currentCategory={category} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Search bar — wrapped in Suspense because it uses useSearchParams */}
          <div className="mb-6">
            <Suspense
              fallback={
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              }
            >
              <ProductSearch currentSearch={search} currentSort={sort} />
            </Suspense>
          </div>

          {/* Product grid */}
          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {pages.map((p) => (
                <Link
                  key={p}
                  href={`/products${pageQuery(p)}`}
                  className={
                    p === page
                      ? 'inline-flex items-center justify-center w-10 h-10 rounded-btn text-sm font-medium bg-ocean-700 text-white'
                      : 'inline-flex items-center justify-center w-10 h-10 rounded-btn text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors'
                  }
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
