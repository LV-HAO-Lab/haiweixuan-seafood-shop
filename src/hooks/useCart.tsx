'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/types'

const STORAGE_KEY = 'seafood_shop_cart'

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage full or private-browsing restriction – silently ignore
  }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (skuId: string) => void
  updateQuantity: (skuId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on first client mount
  useEffect(() => {
    setItems(loadCart())
    setMounted(true)
  }, [])

  // Persist to localStorage whenever items change (skip the initial empty write)
  useEffect(() => {
    if (!mounted) return
    saveCart(items)
  }, [items, mounted])

  // --- methods ---------------------------------------------------------------
  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.skuId === item.skuId)
      if (idx !== -1) {
        // merge by skuId: increment quantity
        const next = [...prev]
        const current = next[idx]
        next[idx] = {
          ...current,
          quantity: Math.min(current.quantity + item.quantity, current.stock),
        }
        return next
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((skuId: string) => {
    setItems((prev) => prev.filter((i) => i.skuId !== skuId))
  }, [])

  const updateQuantity = useCallback((skuId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.skuId !== skuId)
      }
      return prev.map((i) =>
        i.skuId === skuId ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
      )
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, totalAmount }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalAmount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a <CartProvider>')
  }
  return ctx
}
