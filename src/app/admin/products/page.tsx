import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ProductListClient from './ProductListClient'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { skus: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新增商品
        </Link>
      </div>

      <div className="card">
        <ProductListClient products={JSON.parse(JSON.stringify(products))} />
      </div>
    </div>
  )
}
