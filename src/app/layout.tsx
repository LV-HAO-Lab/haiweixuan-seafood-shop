import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: { default: '海味轩 - 精品海鲜商城', template: '%s | 海味轩' },
  description: '精选海参、鲍鱼、佛跳墙、花胶、水饺等高端海产品，源头直供，品质保证。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
