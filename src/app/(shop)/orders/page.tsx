'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Package, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'

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
  createdAt: string
  items: OrderItem[]
}

const TABS = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: ORDER_STATUS_LABELS.PENDING },
  { key: 'PAID', label: ORDER_STATUS_LABELS.PAID },
  { key: 'SHIPPED', label: ORDER_STATUS_LABELS.SHIPPED },
  { key: 'COMPLETED', label: ORDER_STATUS_LABELS.COMPLETED }
]

function statusBadgeVariant(status: string): 'warning' | 'info' | 'default' | 'success' | 'danger' {
  const map: Record<string, 'warning' | 'info' | 'default' | 'success' | 'danger'> = {
    PENDING: 'warning',
    PAID: 'info',
    SHIPPED: 'default',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'default'
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (authStatus !== 'authenticated') return

    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        setOrders(data)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [authStatus, router])

  if (authStatus === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-ocean-700" size={32} />
      </div>
    )
  }

  const filteredOrders =
    activeTab === 'ALL'
      ? orders.filter((o) => o.status !== 'CANCELLED')
      : orders.filter((o) => o.status === activeTab)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">我的订单</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-btn text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-ocean-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-ocean-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <Package size={48} className="mb-4" />
          <p className="text-lg">
            {activeTab === 'ALL' ? '暂无订单' : `暂无${TABS.find((t) => t.key === activeTab)?.label || ''}订单`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">
                    订单号：{order.id.slice(0, 16)}...
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(order.status)}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Badge>
              </div>

              <div className="border-t border-gray-50 pt-3">
                <p className="text-sm text-gray-600 truncate">
                  {order.items
                    .map((item) => `${item.productName} x${item.quantity}`)
                    .join('、')}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">
                    共 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                  </span>
                  <span className="text-lg font-bold text-accent">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
