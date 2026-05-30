'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_LABELS } from '@/types'
import ShipButton from './ShipButton'

const ALL_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'] as const
type OrderStatus = (typeof ALL_STATUSES)[number]

interface OrderActionsProps {
  orderId: string
  currentStatus: string
}

export default function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter()
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState('')

  // Show all statuses except the current one and CANCELLED (cancelling is a separate concern)
  const availableStatuses = ALL_STATUSES.filter(
    (s) => s !== currentStatus && s !== 'CANCELLED'
  )

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatusLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '状态更新失败')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('确定要取消该订单吗？取消后将退还库存。')) return
    setStatusLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '取消订单失败')
      router.refresh()
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setStatusLoading(false)
    }
  }

  const handleRefresh = () => {
    router.refresh()
  }

  // Cancelled orders - no actions
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="pt-2 text-center">
        <p className="text-sm text-gray-400">订单已取消</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Ship button for PAID orders */}
      {currentStatus === 'PAID' && (
        <ShipButton orderId={orderId} onSuccess={handleRefresh} />
      )}

      {/* Status change dropdown */}
      {availableStatuses.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">更改订单状态</label>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(status)}
                disabled={statusLoading}
              >
                {ORDER_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Cancel button (always available for non-cancelled orders) */}
      <Button
        variant="danger"
        size="sm"
        onClick={handleCancel}
        disabled={statusLoading}
        className="w-full"
      >
        {statusLoading ? (
          <Loader2 size={16} className="mr-1 animate-spin" />
        ) : null}
        取消订单
      </Button>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
