'use client'

import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCart()
  const router = useRouter()

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-600 mb-6">购物车是空的</h2>
        <Link href="/products" className="btn-primary">
          去逛逛
        </Link>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Cart with items
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">购物车</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== LEFT: Cart items list ========== */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.skuId} className="card flex items-center gap-4">
              {/* Product image */}
              <div className="w-20 h-20 rounded-btn overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        const fallback = document.createElement('span')
                        fallback.className = 'text-2xl'
                        fallback.textContent = '🦪'
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                ) : (
                  <span className="text-2xl">🦪</span>
                )}
              </div>

              {/* Product info + quantity */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.skuLabel}</p>

                <div className="flex items-center gap-3 mt-2">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-gray-300 rounded-btn">
                    <button
                      onClick={() => updateQuantity(item.skuId, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      aria-label="减少数量"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="增加数量"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Line total price + delete */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p className="text-accent font-bold whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.skuId)}
                  className="text-gray-400 hover:text-accent transition-colors"
                  aria-label="删除商品"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ========== RIGHT: Order summary ========== */}
        <div className="lg:col-span-1">
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-800">订单摘要</h2>

            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex justify-between">
                <span>商品数量</span>
                <span>{items.length} 件</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-500">合计</span>
                <span className="text-lg font-bold text-accent">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push('/cart/checkout')}
            >
              去结算
            </Button>

            <button
              onClick={clearCart}
              className="w-full text-sm text-gray-400 hover:text-accent transition-colors py-2"
            >
              清空购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
