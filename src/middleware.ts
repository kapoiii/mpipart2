import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = (session?.user as { role?: string })?.role
  const isAdmin = role === 'ADMIN'

  // Protect admin routes — ADMIN role required
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isAdmin) {
      // Redirect regular user to home page if attempting to access admin page
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect user booking routes — Login required
  if (pathname.startsWith('/booking') || pathname.startsWith('/my-bookings')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Single Login Page logic:
  // Redirect logged-in users away from /login and /register based on their role
  if ((pathname === '/login' || pathname === '/register') && session) {
    const redirectTarget = isAdmin ? '/admin/trips' : '/'
    return NextResponse.redirect(new URL(redirectTarget, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
