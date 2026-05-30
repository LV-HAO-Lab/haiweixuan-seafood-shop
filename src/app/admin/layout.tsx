import Link from 'next/link'
import { Home } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'

export const metadata = {
  title: { default: '管理后台', template: '%s | 管理后台 - 海味轩' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ocean-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            返回前台
          </Link>
        </header>

        {/* Content area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
