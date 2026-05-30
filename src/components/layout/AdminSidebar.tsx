'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react'

const navItems = [
  { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { label: '商品管理', href: '/admin/products', icon: Package },
  { label: '订单管理', href: '/admin/orders', icon: ShoppingCart },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-white border-r pt-16 flex-shrink-0">
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm transition-colors ${
                isActive
                  ? 'bg-ocean-50 text-ocean-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
