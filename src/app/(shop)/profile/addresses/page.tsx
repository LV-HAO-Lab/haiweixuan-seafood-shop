'use client'

import { useEffect, useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'

interface Address {
  id: string
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  createdAt: string
}

const emptyForm = {
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/addresses')
      if (!res.ok) return
      const data = await res.json()
      setAddresses(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const openNewForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (address: Address) => {
    setForm({
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      isDefault: address.isDefault,
    })
    setEditingId(address.id)
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async () => {
    if (
      !form.recipientName ||
      !form.phone ||
      !form.province ||
      !form.city ||
      !form.district ||
      !form.detail
    ) {
      setError('请填写所有必填字段')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (editingId) {
        const res = await fetch(`/api/addresses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || '更新失败')
          return
        }
      } else {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || '添加失败')
          return
        }
      }
      closeForm()
      await fetchAddresses()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个收货地址吗？')) return

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch {
      // silently ignore
    }
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (!loading && addresses.length === 0 && !showForm) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <MapPin size={64} className="text-gray-300 mb-4" />
        <p className="text-lg text-gray-500 mb-2">暂无收货地址</p>
        <p className="text-sm text-gray-400 mb-6">添加一个收货地址，方便快速下单</p>
        <button className="btn-primary" onClick={openNewForm}>
          新增地址
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Address list + optional form
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">收货地址</h1>
        <button className="btn-primary" onClick={openNewForm}>
          <Plus size={16} className="mr-1 inline" />
          新增地址
        </button>
      </div>

      {/* Address cards */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="card flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-800">
                  {address.recipientName}
                </h3>
                <span className="text-sm text-gray-500">{address.phone}</span>
                {address.isDefault && (
                  <Badge variant="success">默认</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {address.province}
                {address.city}
                {address.district}
                {address.detail}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => openEditForm(address)}
                className="p-1.5 text-gray-400 hover:text-ocean-700 transition-colors"
                aria-label="编辑地址"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(address.id)}
                className="p-1.5 text-gray-400 hover:text-accent transition-colors"
                aria-label="删除地址"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========== FORM MODAL ========== */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? '编辑地址' : '新增地址'}
            </h2>

            {error && (
              <p className="text-sm text-accent mb-4 bg-red-50 px-3 py-2 rounded-btn">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    收件人 <span className="text-accent">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="请输入收件人姓名"
                    value={form.recipientName}
                    onChange={(e) =>
                      setForm({ ...form, recipientName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手机号 <span className="text-accent">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="请输入手机号"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    省份 <span className="text-accent">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="省"
                    value={form.province}
                    onChange={(e) =>
                      setForm({ ...form, province: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    城市 <span className="text-accent">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="市"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    区/县 <span className="text-accent">*</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="区/县"
                    value={form.district}
                    onChange={(e) =>
                      setForm({ ...form, district: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  详细地址 <span className="text-accent">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="街道、门牌号等"
                  value={form.detail}
                  onChange={(e) =>
                    setForm({ ...form, detail: e.target.value })
                  }
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-ocean-700 focus:ring-ocean-500"
                />
                <span className="text-sm text-gray-700">设为默认地址</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={closeForm} disabled={saving}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
