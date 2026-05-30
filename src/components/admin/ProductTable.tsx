'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/types'
import { formatPrice, getImages } from '@/lib/utils'

interface Sku {
  id: string
  sku: string
  price: number | string
  stock: number
  image: string | null
  isDefault: boolean
}

interface Product {
  id: string
  name: string
  category: string
  images: string[]
  basePrice: number | string
  isPublished: boolean
  skus: Sku[]
}

interface ProductTableProps {
  products: Product[]
  onRefresh: () => void
}

export default function ProductTable({ products, onRefresh }: ProductTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`确定要下架 "${productName}" 吗？`)) return

    setDeleting(productId)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '删除失败')
        return
      }
      onRefresh()
    } catch {
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
    }
  }

  const getStockSum = (skus: Sku[]) => {
    return skus.reduce((sum, sku) => sum + sku.stock, 0)
  }

  const getFirstImage = (product: Product) => {
    const images = getImages(product.images)
    if (images.length > 0) return images[0]
    for (const sku of product.skus) {
      if (sku.image) return sku.image
    }
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3">商品</th>
            <th className="px-4 py-3">名称</th>
            <th className="px-4 py-3">分类</th>
            <th className="px-4 py-3">基础价格</th>
            <th className="px-4 py-3">总库存</th>
            <th className="px-4 py-3">状态</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                暂无商品数据
              </td>
            </tr>
          )}
          {products.map((product) => {
            const firstImage = getFirstImage(product)
            return (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {firstImage ? (
                    <Image
                      src={firstImage}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 rounded">
                      📦
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {CATEGORY_LABELS[product.category] || product.category}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {formatPrice(product.basePrice)}
                </td>
                <td className="px-4 py-3">
                  {getStockSum(product.skus)}
                </td>
                <td className="px-4 py-3">
                  {product.isPublished ? (
                    <Badge variant="success">已上架</Badge>
                  ) : (
                    <Badge variant="warning">草稿</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-ocean-700 hover:text-ocean-800 text-sm font-medium"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleting === product.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === product.id ? '处理中...' : '下架'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
