'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'

interface OrderItem {
  id: string
  productName: string
  skuLabel: string
  price: number | string
  quantity: number
}

interface Order {
  id: string
  status: string
  totalAmount: number | string
  createdAt: string | Date
  items: OrderItem[]
  user?: {
    name: string
    email: string
  }
}

interface OrderTableProps {
  orders: Order[]
}

function statusBadgeVariant(
  status: string
): 'warning' | 'info' | 'default' | 'success' | 'danger' {
  const map: Record<string, 'warning' | 'info' | 'default' | 'success' | 'danger'> = {
    PENDING: 'warning',
    PAID: 'info',
    SHIPPED: 'default',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  }
  return map[status] || 'default'
}

export default function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3">订单编号</th>
            <th className="px-4 py-3">客户</th>
            <th className="px-4 py-3">商品</th>
            <th className="px-4 py-3">金额</th>
            <th className="px-4 py-3">状态</th>
            <th className="px-4 py-3">时间</th>
            <th className="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                暂无订单数据
              </td>
            </tr>
          )}
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
            const itemNames = order.items
              .slice(0, 3)
              .map((item) => item.productName)
              .join('、')
            const moreItems =
              order.items.length > 3 ? ` 等${order.items.length}种` : ''

            return (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {order.id.slice(0, 12)}...
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {order.user?.name || '—'}
                  </div>
                  {order.user?.email && (
                    <div className="text-xs text-gray-400">{order.user.email}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                  <span className="text-xs text-gray-400 mr-1">({itemCount}件)</span>
                  {itemNames}
                  {moreItems}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant(order.status)}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-ocean-700 hover:text-ocean-800 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    查看
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
