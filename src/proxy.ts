import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const session = await auth()
  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role

  // Public routes: home, login, reset-password, customer routes (token meja)
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname.match(/^\/reset-password\/[a-zA-Z0-9]+$/) ||
    pathname.match(/^\/[a-zA-Z0-9-]+$/) || // Customer token route: /[tokenMeja]
    pathname.match(/^\/[a-zA-Z0-9-]+\/pesanan$/) || // /[tokenMeja]/pesanan
    pathname.match(/^\/[a-zA-Z0-9-]+\/checkout$/) || // /[tokenMeja]/checkout
    pathname.match(/^\/[a-zA-Z0-9-]+\/pembayaran/) // /[tokenMeja]/pembayaran*

  // Kalau sudah login dan akses login, redirect ke dashboard
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Kalau belum login dan akses protected route, redirect ke login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
}