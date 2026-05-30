'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, getImages } from '@/lib/utils'
import SkuSelector from '@/components/product/SkuSelector'

interface SkuItem {
  id: string
  sku: string
  price: number | { toString(): string }
  stock: number
  isDefault: boolean
}

interface ProductInfo {
  id: string
  name: string
  images: string[]
  skus: SkuItem[]
}

interface AddToCartButtonProps {
  product: ProductInfo
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCart()

  const defaultSku = product.skus.find((s) => s.isDefault) ?? product.skus[0]
  const [selectedSkuId, setSelectedSkuId] = useState<string | undefined>(
    defaultSku?.id
  )
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState(false)

  const selectedSku = product.skus.find((s) => s.id === selectedSkuId)
  const isOutOfStock = !selectedSku || selectedSku.stock === 0

  const handleAddToCart = useCallback(() => {
    if (!session?.user) {
      router.push('/auth/login')
      return
    }
    if (!selectedSku || isOutOfStock) return

    addItem({
      productId: product.id,
      skuId: selectedSku.id,
      name: product.name,
      skuLabel: selectedSku.sku,
      price: Number(selectedSku.price),
      image: getImages(product.images)[0] || '',
      quantity,
      stock: selectedSku.stock,
    })

    setFeedback(true)
    setTimeout(() => setFeedback(false), 1500)
  }, [
    session,
    selectedSku,
    isOutOfStock,
    router,
    addItem,
    product,
    quantity,
  ])

  const handleBuyNow = useCallback(() => {
    if (!session?.user) {
      router.push('/auth/login')
      return
    }
    if (!selectedSku || isOutOfStock) return

    addItem({
      productId: product.id,
      skuId: selectedSku.id,
      name: product.name,
      skuLabel: selectedSku.sku,
      price: Number(selectedSku.price),
      image: getImages(product.images)[0] || '',
      quantity,
      stock: selectedSku.stock,
    })

    router.push('/cart')
  }, [
    session,
    selectedSku,
    isOutOfStock,
    router,
    addItem,
    product,
    quantity,
  ])

  return (
    <div className="space-y-4">
      {/* SKU Selector */}
      <SkuSelector
        skus={product.skus.map((s) => ({
          ...s,
          price: Number(s.price),
        }))}
        selectedSkuId={selectedSkuId}
        onSelect={setSelectedSkuId}
      />

      {/* Selected SKU info */}
      {selectedSku && !isOutOfStock && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            <span className="text-gray-400">价格：</span>
            <span className="text-accent font-bold text-lg">
              {formatPrice(Number(selectedSku.price))}
            </span>
          </span>
          <span>
            <span className="text-gray-400">库存：</span>
            <span>{selectedSku.stock}</span>
          </span>
        </div>
      )}

      {isOutOfStock && selectedSku && (
        <p className="text-sm text-gray-400">该规格已售罄</p>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">数量：</span>
        <div className="flex items-center border border-gray-300 rounded-btn">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => q - 1)}
            className="p-2 text-gray-600 hover:text-ocean-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-1 text-sm font-medium min-w-[3rem] text-center select-none">
            {quantity}
          </span>
          <button
            type="button"
            disabled={isOutOfStock || quantity >= (selectedSku?.stock || 0)}
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2 text-gray-600 hover:text-ocean-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="btn-outline inline-flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          加入购物车
        </button>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="btn-primary"
        >
          立即购买
        </button>
        {feedback && (
          <span className="text-green-600 text-sm font-medium animate-pulse">
            已添加 ✓
          </span>
        )}
      </div>
    </div>
  )
}
