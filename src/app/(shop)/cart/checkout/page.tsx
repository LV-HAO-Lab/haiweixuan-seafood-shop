'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface Address {
  id: string
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, totalAmount } = useCart()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addressesLoading, setAddressesLoading] = useState(true)

  // Fetch addresses on mount
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch('/api/addresses')
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login')
            return
          }
          throw new Error('Failed to fetch addresses')
        }
        const data: Address[] = await res.json()
        setAddresses(data)
        // Auto-select default address
        const defaultAddr = data.find((a) => a.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        }
      } catch {
        setError('加载地址失败')
      } finally {
        setAddressesLoading(false)
      }
    }
    fetchAddresses()
  }, [router])

  // Redirect to cart if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500 mb-4">购物车是空的</p>
        <Link href="/cart" className="btn-outline">
          返回购物车
        </Link>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!selectedAddressId) {
      setError('请选择收货地址')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          items: items.map((item) => ({
            productId: item.productId,
            skuId: item.skuId,
            quantity: item.quantity,
          })),
          notes: notes || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '下单失败')
      }

      clearCart()
      router.push(`/orders/${data.id}`)
    } catch (err: any) {
      setError(err.message || '下单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const fullAddress = (addr: Address) =>
    `${addr.province}${addr.city}${addr.district} ${addr.detail}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">确认订单</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Address + Order items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address selection */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">收货地址</h2>
            {addressesLoading ? (
              <p className="text-sm text-gray-400">加载中...</p>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-500">
                <p className="mb-2">暂无地址，请先添加</p>
                <Link href="/profile/addresses" className="text-ocean-700 hover:underline">
                  去添加地址
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 border rounded-btn cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-ocean-700 bg-ocean-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 accent-ocean-700"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {addr.recipientName}
                        <span className="text-sm text-gray-500 font-normal ml-2">
                          {addr.phone}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{fullAddress(addr)}</p>
                      {addr.isDefault && (
                        <span className="inline-block mt-1 text-xs text-ocean-700 bg-ocean-100 px-2 py-0.5 rounded">
                          默认
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">商品明细</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.skuId} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    {/* Product image */}
                    <div className="w-16 h-16 rounded-btn overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="text-xl">🦪</span>
                      )}
                    </div>

                    {/* Name + SKU + quantity */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.skuLabel}</p>
                      <p className="text-sm text-gray-400 mt-0.5">x{item.quantity}</p>
                    </div>

                    {/* Line total */}
                    <div className="flex-shrink-0">
                      <p className="font-bold text-accent whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Order summary */}
        <div className="lg:col-span-1">
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-800">订单摘要</h2>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm text-gray-600 mb-1">
                订单备注（选填）
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                placeholder="如有特殊需求请在此备注..."
              />
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex justify-between">
                <span>商品数量</span>
                <span>{items.length} 件</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-500">合计</span>
                <span className="text-xl font-bold text-accent">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              variant="primary"
              className="w-full"
              onClick={handleSubmit}
              disabled={loading || !selectedAddressId || items.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  提交中...
                </>
              ) : (
                '提交订单'
              )}
            </Button>

            <Link
              href="/cart"
              className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
            >
              返回购物车
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
