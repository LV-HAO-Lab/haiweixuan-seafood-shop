import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'
import OrderActions from './OrderActions'

interface Props {
  params: { id: string }
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

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
      address: true,
    },
  })

  if (!order) {
    return (
      <div>
        <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1">
          <ArrowLeft size={16} />
          返回订单列表
        </Link>
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg">订单不存在</p>
        </div>
      </div>
    )
  }

  const fullAddress = `${order.address.province}${order.address.city}${order.address.district} ${order.address.detail}`

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
        <Badge variant={statusBadgeVariant(order.status)} className="ml-auto">
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">客户信息</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">姓名</span>
                <span className="text-gray-800 font-medium">{order.user.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">邮箱</span>
                <span className="text-gray-800">{order.user.email}</span>
              </div>
            </div>
          </div>

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
                        {formatPrice(Number(item.price))} x{item.quantity}
                      </span>
                      <span className="font-bold text-accent whitespace-nowrap">
                        {formatPrice(Number(item.price) * item.quantity)}
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
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <OrderActions
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
