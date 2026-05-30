import { prisma } from '@/lib/prisma'
import { Package, ShoppingCart, Truck, DollarSign } from 'lucide-react'
import DashboardStats from '@/components/admin/DashboardStats'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalProducts, todayOrders, pendingShipment, revenueResult] =
    await Promise.all([
      prisma.product.count({ where: { isPublished: true } }),
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.order.count({
        where: { status: 'PAID' },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ])

  const revenue = revenueResult._sum.totalAmount
    ? Number(revenueResult._sum.totalAmount)
    : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats
          title="在售商品"
          value={totalProducts.toString()}
          icon={<Package className="h-8 w-8 text-ocean-700" />}
          colorClass="bg-ocean-50"
        />
        <DashboardStats
          title="今日订单"
          value={todayOrders.toString()}
          icon={<ShoppingCart className="h-8 w-8 text-amber-700" />}
          colorClass="bg-amber-50"
        />
        <DashboardStats
          title="待发货"
          value={pendingShipment.toString()}
          icon={<Truck className="h-8 w-8 text-red-600" />}
          colorClass="bg-red-50"
        />
        <DashboardStats
          title="总收入"
          value={`¥${revenue.toFixed(2)}`}
          icon={<DollarSign className="h-8 w-8 text-green-600" />}
          colorClass="bg-green-50"
        />
      </div>
    </div>
  )
}
