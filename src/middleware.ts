import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isAdmin = (req.auth?.user as any)?.role === 'ADMIN'

  const userRoutes = ['/cart', '/orders', '/profile', '/api/addresses']
  const adminRoutes = ['/admin', '/api/admin']

  if (userRoutes.some(r => pathname.startsWith(r)) ||
      (pathname.startsWith('/api/orders') && !pathname.startsWith('/api/admin'))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (adminRoutes.some(r => pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/login', req.url))
    if (!isAdmin) return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/cart/:path*', '/orders/:path*', '/profile/:path*', '/admin/:path*',
            '/api/addresses/:path*', '/api/orders/:path*', '/api/admin/:path*']
}
