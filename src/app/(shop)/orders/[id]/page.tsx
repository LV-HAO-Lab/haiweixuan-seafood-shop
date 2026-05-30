'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'

interface Address {
  id: string
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
}

interface OrderItem {
  id: string
  productName: string
  skuLabel: string
  price: number
  quantity: number
}

interface Order {
  id: string
  status: string
  totalAmount: number
  paymentMethod: string | null
  trackingNumber: string | null
  paidAt: string | null
  shippedAt: string | null
  completedAt: string | null
  createdAt: string
  notes: string | null
  address: Address
  items: OrderItem[]
}

const STATUS_STEPS = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'] as const

function statusBadgeVariant(
  status: string
): 'warning' | 'info' | 'default' | 'success' | 'danger' {
  const map: Record<string, any> = {
    PENDING: 'warning',
    PAID: 'info',
    SHIPPED: 'default',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'default'
}

function isStatusActive(orderStatus: string, step: string): boolean {
  const orderIdx = STATUS_STEPS.indexOf(orderStatus as any)
  const stepIdx = STATUS_STEPS.indexOf(step as any)
  if (orderIdx === -1) return false
  return stepIdx <= orderIdx
}

function isStatusCurrent(orderStatus: string, step: string): boolean {
  return orderStatus === step
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const [payingMethod, setPayingMethod] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.status === 401) {
        router.push('/auth/login')
        return
      }
      if (res.status === 404) {
        setError('订单不存在')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch order')
      const data = await res.json()
      setOrder(data)
    } catch {
      setError('加载订单失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (authStatus !== 'authenticated') return
    fetchOrder()
  }, [authStatus, id, router])

  const handleCancel = async () => {
    if (!confirm('确定要取消该订单吗？')) return
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '取消失败')
      setOrder(data)
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmReceipt = async () => {
    if (!confirm('确认已收到货物？')) return
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '操作失败')
      setOrder(data)
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePay = async (paymentMethod: string) => {
    setPaying(true)
    setPayingMethod(paymentMethod)
    setError('')
    try {
      const res = await fetch(`/api/payment/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '支付失败')
      setPaySuccess(true)
      setTimeout(() => {
        setShowPaymentModal(false)
        setPaySuccess(false)
        setPayingMethod(null)
        fetchOrder()
      }, 1200)
    } catch (err: any) {
      setError(err.message || '支付失败')
    } finally {
      setPaying(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-ocean-700" size={32} />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <XCircle size={48} className="mb-4" />
          <p className="text-lg">{error}</p>
          <Link href="/orders" className="btn-outline mt-4">
            返回订单列表
          </Link>
        </div>
      </div>
    )
  }

  if (!order) return null

  const fullAddress = `${order.address.province}${order.address.city}${order.address.district} ${order.address.detail}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">订单详情</h1>
        <Badge variant={statusBadgeVariant(order.status)} className="ml-auto">
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>

      {/* Status Flow (only for non-cancelled) */}
      {order.status !== 'CANCELLED' && (
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const active = isStatusActive(order.status, step)
              const current = isStatusCurrent(order.status, step)
              const Icon = step === 'PENDING' ? CreditCard
                : step === 'PAID' ? CheckCircle
                : step === 'SHIPPED' ? Truck
                : CheckCircle

              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        current
                          ? 'bg-ocean-700 text-white'
                          : active
                          ? 'bg-ocean-100 text-ocean-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`text-xs mt-2 whitespace-nowrap ${
                        active ? 'text-ocean-700 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mt-[-20px] transition-colors ${
                        isStatusActive(order.status, STATUS_STEPS[idx + 1]) ||
                        active
                          ? 'bg-ocean-700'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Card */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} />
              收货地址
            </h2>
            <p className="font-medium text-gray-800">
              {order.address.recipientName}
              <span className="text-sm text-gray-500 font-normal ml-2">
                {order.address.phone}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{fullAddress}</p>
          </div>

          {/* Items List */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">商品明细</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-400">{item.skuLabel}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-sm text-gray-500">
                        {formatPrice(item.price)} x{item.quantity}
                      </span>
                      <span className="font-bold text-accent whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-800">订单信息</h2>

            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex justify-between">
                <span>订单编号</span>
                <span className="text-gray-800 font-mono text-xs max-w-[140px] truncate">
                  {order.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>创建时间</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span>支付方式</span>
                  <span>{order.paymentMethod === 'ALIPAY' ? '支付宝' : '微信支付'}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span>支付时间</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span>物流单号</span>
                  <span className="text-gray-800 font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span>发货时间</span>
                  <span>{formatDate(order.shippedAt)}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex justify-between">
                  <span>完成时间</span>
                  <span>{formatDate(order.completedAt)}</span>
                </div>
              )}
              {order.notes && (
                <div className="flex justify-between">
                  <span>备注</span>
                  <span className="text-right max-w-[180px]">{order.notes}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-500">订单总额</span>
                <span className="text-2xl font-bold text-accent">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            {order.status === 'PENDING' && (
              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={actionLoading}
                >
                  <CreditCard size={18} className="mr-2" />
                  去支付
                </Button>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <XCircle size={18} className="mr-2" />
                  取消订单
                </Button>
              </div>
            )}

            {order.status === 'SHIPPED' && (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleConfirmReceipt}
                disabled={actionLoading}
              >
                <CheckCircle size={18} className="mr-2" />
                确认收货
              </Button>
            )}

            {order.status === 'COMPLETED' && order.completedAt && (
              <div className="pt-2 text-center">
                <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  已于 {formatDate(order.completedAt)} 完成
                </p>
              </div>
            )}

            {order.status === 'CANCELLED' && (
              <div className="pt-2 text-center">
                <XCircle size={24} className="text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">订单已取消</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!paying && !paySuccess) setShowPaymentModal(false)
            }}
          />
          <div className="relative bg-white rounded-card shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">选择支付方式</h2>

            <p className="text-sm text-gray-500 mb-4">
              订单金额：
              <span className="text-2xl font-bold text-accent ml-2">
                {formatPrice(order.totalAmount)}
              </span>
            </p>

            {paySuccess ? (
              <div className="flex flex-col items-center py-8">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <p className="text-lg font-bold text-gray-800">支付成功</p>
                <p className="text-sm text-gray-500 mt-1">
                  {payingMethod === 'ALIPAY' ? '支付宝' : '微信支付'}付款已完成
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Alipay */}
                <button
                  onClick={() => handlePay('ALIPAY')}
                  disabled={paying}
                  className="w-full flex items-center gap-4 p-4 rounded-btn border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-blue-700">支付宝</p>
                    <p className="text-xs text-gray-400">安全快捷的在线支付</p>
                  </div>
                  {paying && payingMethod === 'ALIPAY' && (
                    <Loader2 size={20} className="animate-spin text-blue-600 ml-auto" />
                  )}
                </button>

                {/* WeChat */}
                <button
                  onClick={() => handlePay('WECHAT')}
                  disabled={paying}
                  className="w-full flex items-center gap-4 p-4 rounded-btn border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-700">微信支付</p>
                    <p className="text-xs text-gray-400">便捷的移动支付体验</p>
                  </div>
                  {paying && payingMethod === 'WECHAT' && (
                    <Loader2 size={20} className="animate-spin text-green-600 ml-auto" />
                  )}
                </button>

                {/* Cancel button */}
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paying}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
