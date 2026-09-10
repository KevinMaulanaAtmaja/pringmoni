import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

type RoleUser = 'owner' | 'cashier' | 'waiter'

// Route access mapping: which roles can access which dashboard paths
const roleRouteAccess: Record<string, RoleUser[]> = {
  "/dashboard": ["owner", "cashier", "waiter"],
  "/dashboard/pesanan": ["owner", "cashier", "waiter"],
  "/dashboard/kasir": ["owner", "cashier"],
  "/dashboard/menu": ["owner"],
  "/dashboard/meja": ["owner"],
  "/dashboard/users": ["owner"],
  "/dashboard/laporan": ["owner"],
  "/dashboard/logging": ["owner"],
}

function getRouteRole(pathname: string): RoleUser[] | null {
  // Exact match first
  if (roleRouteAccess[pathname]) return roleRouteAccess[pathname]

  // Check prefix matches (e.g., /dashboard/pesanan/123, /dashboard/kasir/pesanan-baru/456)
  for (const [route, roles] of Object.entries(roleRouteAccess)) {
    if (pathname.startsWith(route + "/")) return roles
  }

  return null
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const session = await auth()
  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role as RoleUser | undefined

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

  // Role-based access: cek apakah user punya akses ke route ini
  const allowedRoles = getRouteRole(pathname)
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect ke dashboard utama kalau tidak punya akses
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
}