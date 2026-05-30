'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const SORT_OPTIONS = [
  { value: 'newest', label: '最新上架' },
  { value: 'sales', label: '销量最高' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
]

interface ProductSearchProps {
  currentSearch?: string
  currentSort?: string
}

export default function ProductSearch({
  currentSearch = '',
  currentSort = 'newest',
}: ProductSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch)

  // Sync local state when props change (e.g. browser back/forward)
  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])

  const buildUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Remove page param when search or sort changes
      delete updates['page']
      params.delete('page')
      // Apply updates
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      const query = params.toString()
      return `/products${query ? `?${query}` : ''}`
    },
    [searchParams],
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl({ search: searchValue }))
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl({ sort: e.target.value }))
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索商品..."
            className="input-field pl-10 pr-20"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 btn-primary py-1 px-3 text-sm"
          >
            搜索
          </button>
        </div>
      </form>

      {/* Sort dropdown */}
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="input-field sm:w-44"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
