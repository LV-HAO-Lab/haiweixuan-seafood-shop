'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Package, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

const categoryLinks = [
  { label: '全部商品', href: '/products' },
  { label: '海参', href: '/products?category=SEA_CUCUMBER' },
  { label: '鲍鱼', href: '/products?category=ABALONE' },
  { label: '佛跳墙', href: '/products?category=BUDDHA_FEAST' },
  { label: '花胶', href: '/products?category=FISH_MAW' },
  { label: '水饺', href: '/products?category=DUMPLING' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const { items } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b shadow-sm">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Desktop nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-ocean-700">
            海味轩
          </Link>

          {/* Desktop category links – hidden on mobile, shown on lg+ */}
          <ul className="hidden lg:flex items-center gap-6">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-600 transition-colors hover:text-ocean-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Cart + User + Mobile toggle */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative text-gray-600 hover:text-ocean-700 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white leading-none">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* User section */}
          {session?.user ? (
            <>
              <Link href="/orders" className="text-gray-600 hover:text-ocean-700 transition-colors">
                <Package className="h-5 w-5" />
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-ocean-700 transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <span className="hidden md:inline text-sm text-gray-700">
                {session.user.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-accent transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-ocean-700 hover:text-ocean-800 transition-colors"
            >
              登录
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden text-gray-600 hover:text-ocean-700 transition-colors"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile category dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t bg-white shadow-sm">
          <ul className="flex flex-col px-4 py-2">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-sm text-gray-600 hover:text-ocean-700 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
