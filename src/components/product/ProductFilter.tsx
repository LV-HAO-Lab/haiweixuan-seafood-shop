import Link from 'next/link'
import { CATEGORY_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface ProductFilterProps {
  currentCategory?: string
}

export default function ProductFilter({ currentCategory }: ProductFilterProps) {
  const allCategories = Object.entries(CATEGORY_LABELS)

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">商品分类</h3>
      <ul className="space-y-1">
        {/* "全部商品" link — highlighted when no category is selected */}
        <li>
          <Link
            href="/products"
            className={cn(
              'block px-3 py-2 rounded-btn text-sm transition-colors',
              !currentCategory
                ? 'bg-ocean-50 text-ocean-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-ocean-700',
            )}
          >
            全部商品
          </Link>
        </li>

        {/* Individual category links */}
        {allCategories.map(([key, label]) => (
          <li key={key}>
            <Link
              href={`/products?category=${key}`}
              className={cn(
                'block px-3 py-2 rounded-btn text-sm transition-colors',
                currentCategory === key
                  ? 'bg-ocean-50 text-ocean-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-ocean-700',
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
