'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, MapPin, ShoppingBag, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: '我的订单', href: '/orders', icon: Package },
  { label: '收货地址', href: '/profile/addresses', icon: MapPin },
  { label: '购物车', href: '/cart', icon: ShoppingBag },
]

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [orderCount, setOrderCount] = useState<number>(0)
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (authStatus !== 'authenticated') return

    async function fetchOrderCount() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const orders = await res.json()
          setOrderCount(Array.isArray(orders) ? orders.length : 0)
        }
      } catch {
        // silently handle
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchOrderCount()
  }, [authStatus, router])

  // Loading state
  if (authStatus === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-ocean-700" size={32} />
      </div>
    )
  }

  if (!session?.user) return null

  const user = session.user as any
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">个人中心</h1>

      {/* User info card */}
      <div className="card flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-ocean-100 flex items-center justify-center flex-shrink-0">
          <User size={28} className="text-ocean-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">
            {user.name ?? '用户'}
          </h2>
          <p className="text-gray-500 text-sm truncate">{user.email}</p>
          <div className="mt-1">
            <Badge variant={isAdmin ? 'danger' : 'info'}>
              {isAdmin ? '管理员' : '用户'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-ocean-50 flex items-center justify-center flex-shrink-0">
            <Package size={22} className="text-ocean-700" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {loadingOrders ? (
                <Loader2 size={20} className="animate-spin inline text-ocean-700" />
              ) : (
                orderCount
              )}
            </p>
            <p className="text-sm text-gray-500">订单数量</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="card flex flex-col items-center justify-center gap-3 py-6 hover:shadow-md hover:border-ocean-200 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-ocean-50 flex items-center justify-center">
                <Icon size={22} className="text-ocean-700" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Logout button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        退出登录
      </Button>
    </div>
  )
}
