'use client'

import { cn } from '@/lib/utils'

interface Sku {
  id: string
  sku: string
  price: number | { toString(): string }
  stock: number
  isDefault: boolean
}

interface SkuSelectorProps {
  skus: Sku[]
  selectedSkuId: string | undefined
  onSelect: (skuId: string) => void
}

export default function SkuSelector({
  skus,
  selectedSkuId,
  onSelect,
}: SkuSelectorProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">规格选择</p>
      <div className="flex flex-wrap gap-2">
        {skus.map((sku) => {
          const isSelected = selectedSkuId === sku.id
          const isOutOfStock = sku.stock === 0

          return (
            <button
              key={sku.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelect(sku.id)}
              className={cn(
                'px-4 py-2 text-sm rounded-btn border transition-colors',
                isSelected &&
                  'bg-ocean-700 text-white border-ocean-700',
                isOutOfStock &&
                  'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
                !isSelected &&
                  !isOutOfStock &&
                  'bg-white text-gray-700 border-gray-300 hover:border-ocean-500'
              )}
            >
              {sku.sku}
              {isOutOfStock && <span className="ml-1">(缺货)</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
