'use client'

import { useRouter } from 'next/navigation'
import ProductTable from '@/components/admin/ProductTable'

interface Product {
  id: string
  name: string
  category: string
  images: string[]
  basePrice: number | string
  isPublished: boolean
  skus: {
    id: string
    sku: string
    price: number | string
    stock: number
    image: string | null
    isDefault: boolean
  }[]
}

export default function ProductListClient({ products }: { products: Product[] }) {
  const router = useRouter()

  return (
    <ProductTable
      products={products}
      onRefresh={() => router.refresh()}
    />
  )
}
