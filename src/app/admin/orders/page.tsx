import { prisma } from '@/lib/prisma'
import { ORDER_STATUS_LABELS } from '@/types'
import OrderTable from '@/components/admin/OrderTable'

interface Props {
  searchParams: { status?: string }
}

const TABS = [
  { key: '', label: '全部' },
  { key: 'PENDING', label: ORDER_STATUS_LABELS.PENDING },
  { key: 'PAID', label: ORDER_STATUS_LABELS.PAID },
  { key: 'SHIPPED', label: ORDER_STATUS_LABELS.SHIPPED },
  { key: 'COMPLETED', label: ORDER_STATUS_LABELS.COMPLETED },
]

export default async function AdminOrdersPage({ searchParams }: Props) {
  const status = searchParams.status || ''

  const where: any = {}
  if (status) {
    where.status = status
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单管理</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const isActive = status === tab.key
          return (
            <a
              key={tab.key}
              href={tab.key ? `/admin/orders?status=${tab.key}` : '/admin/orders'}
              className={`px-4 py-2 rounded-btn text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-ocean-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-ocean-300'
              }`}
            >
              {tab.label}
            </a>
          )
        })}
      </div>

      {/* Orders Table */}
      <div className="card">
        <OrderTable orders={JSON.parse(JSON.stringify(orders))} />
      </div>
    </div>
  )
}
