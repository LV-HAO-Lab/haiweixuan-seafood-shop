'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { CATEGORY_LABELS } from '@/types'

interface SkuFormItem {
  key: string
  id?: string
  sku: string
  price: string
  stock: string
  isDefault: boolean
}

let skuKeyCounter = 0
function nextSkuKey(): string {
  return `sku-${++skuKeyCounter}`
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [imagesText, setImagesText] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [skus, setSkus] = useState<SkuFormItem[]>([
    { key: nextSkuKey(), sku: '', price: '', stock: '0', isDefault: true },
  ])

  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    async function fetchProduct() {
      setFetching(true)
      setFetchError('')
      try {
        const res = await fetch(`/api/admin/products/${id}`)
        if (!res.ok) {
          const data = await res.json()
          setFetchError(data.error || '获取商品信息失败')
          return
        }
        const product = await res.json()

        setName(product.name || '')
        setDescription(product.description || '')
        setCategory(product.category || '')
        setImagesText((product.images || []).join('\n'))
        setBasePrice(String(product.basePrice || ''))
        setIsPublished(product.isPublished ?? true)

        if (product.skus && product.skus.length > 0) {
          setSkus(
            product.skus.map((s: any) => ({
              key: nextSkuKey(),
              id: s.id,
              sku: s.sku || '',
              price: String(s.price || ''),
              stock: String(s.stock ?? '0'),
              isDefault: s.isDefault || false,
            }))
          )
        }
      } catch {
        setFetchError('网络错误，请重试')
      } finally {
        setFetching(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const parseImages = (text: string): string[] => {
    if (!text.trim()) return []
    const parts = text.split(/[\n,]+/)
    return parts
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
  }

  const addSku = () => {
    setSkus([
      ...skus,
      { key: nextSkuKey(), sku: '', price: '', stock: '0', isDefault: false },
    ])
  }

  const removeSku = (key: string) => {
    if (skus.length <= 1) return
    const filtered = skus.filter((s) => s.key !== key)
    const hasDefault = filtered.some((s) => s.isDefault)
    if (!hasDefault && filtered.length > 0) {
      filtered[0].isDefault = true
    }
    setSkus(filtered)
  }

  const updateSku = (key: string, field: string, value: string | boolean) => {
    if (field === 'isDefault' && value === true) {
      setSkus(
        skus.map((s) => ({
          ...s,
          isDefault: s.key === key,
        }))
      )
    } else {
      setSkus(
        skus.map((s) => (s.key === key ? { ...s, [field]: value } : s))
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const images = parseImages(imagesText)

    if (!name.trim()) {
      setError('请输入商品名称')
      return
    }
    if (!description.trim()) {
      setError('请输入商品描述')
      return
    }
    if (!category) {
      setError('请选择分类')
      return
    }
    if (images.length === 0) {
      setError('请至少输入一张商品图片URL')
      return
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setError('请输入有效的基础价格')
      return
    }
    for (const sku of skus) {
      if (!sku.sku.trim()) {
        setError('请填写所有规格名称')
        return
      }
      if (!sku.price || Number(sku.price) <= 0) {
        setError('请为所有规格填写有效价格')
        return
      }
    }

    const body = {
      name: name.trim(),
      description: description.trim(),
      category,
      images,
      basePrice: Number(basePrice),
      isPublished,
      skus: skus.map((s) => ({
        sku: s.sku.trim(),
        price: Number(s.price),
        stock: parseInt(s.stock) || 0,
        isDefault: s.isDefault,
      })),
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '更新失败')
        return
      }

      router.push('/admin/products')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{fetchError}</p>
        <Link href="/admin/products" className="btn-outline">
          返回商品列表
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/products"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">编辑商品</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名称
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入商品名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品描述
            </label>
            <textarea
              className="input-field min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入商品描述"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">请选择分类</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                基础价格 (¥)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品图片
            </label>
            <textarea
              className="input-field min-h-[80px]"
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="请输入图片URL，每行一个或用逗号分隔"
            />
            <p className="text-xs text-gray-400 mt-1">
              输入图片URL地址，多个图片用换行或逗号分隔
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-gray-300 text-ocean-700 focus:ring-ocean-500"
              />
              <span className="text-sm font-medium text-gray-700">上架商品</span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-6">
              勾选后商品将在前台展示，取消勾选则仅保存为草稿
            </p>
          </div>
        </div>

        {/* SKU section */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">商品规格</h2>
            <button
              type="button"
              onClick={addSku}
              className="btn-outline text-sm py-1.5 px-3 inline-flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              添加规格
            </button>
          </div>

          <div className="space-y-3">
            {skus.map((sku, index) => (
              <div
                key={sku.key}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">
                      规格名称
                    </label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={sku.sku}
                      onChange={(e) => updateSku(sku.key, 'sku', e.target.value)}
                      placeholder="如: 500g"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">
                      价格 (¥)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input-field text-sm"
                      value={sku.price}
                      onChange={(e) => updateSku(sku.key, 'price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">
                      库存
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input-field text-sm"
                      value={sku.stock}
                      onChange={(e) => updateSku(sku.key, 'stock', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sku.isDefault}
                        onChange={(e) =>
                          updateSku(sku.key, 'isDefault', e.target.checked)
                        }
                        className="rounded border-gray-300 text-ocean-700 focus:ring-ocean-500"
                      />
                      <span className="text-xs text-gray-500">默认</span>
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSku(sku.key)}
                  disabled={skus.length <= 1}
                  className="mt-5 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="删除规格"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '保存中...' : '保存修改'}
          </button>
          <Link href="/admin/products" className="btn-outline">
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
