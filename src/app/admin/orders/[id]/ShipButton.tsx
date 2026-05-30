'use client'

import { useState } from 'react'
import { Truck, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShipButtonProps {
  orderId: string
  onSuccess: () => void
}

export default function ShipButton({ orderId, onSuccess }: ShipButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!trackingNumber.trim()) {
      setError('请输入物流单号')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '发货失败')
      setShowModal(false)
      setTrackingNumber('')
      onSuccess()
    } catch (err: any) {
      setError(err.message || '发货失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setShowModal(false)
    setTrackingNumber('')
    setError('')
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className="w-full"
      >
        <Truck size={18} className="mr-2" />
        发货
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-white rounded-card shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">填写物流信息</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物流单号
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="请输入物流单号"
                  className="input-field"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit()
                  }}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || !trackingNumber.trim()}
                  className="flex-1"
                >
                  {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
                  确认发货
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
