import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import type { RoleUser } from "@/types"

const ALL_ROLES: readonly RoleUser[] = ["owner", "cashier", "waiter"]

// Route access mapping: which roles can access which dashboard paths
const roleRouteAccess: Record<string, RoleUser[]> = {
  "/dashboard": ["owner", "cashier", "waiter"],
  "/dashboard/pesanan": ["owner", "cashier", "waiter"],
  "/dashboard/kasir": ["owner", "cashier"],
  "/dashboard/menu": ["owner"],
  "/dashboard/stok-bahan": ["owner"],
  "/dashboard/resep": ["owner"],
  "/dashboard/meja": ["owner", "cashier", "waiter"],
  "/dashboard/users": ["owner"],
  "/dashboard/laporan": ["owner"],
  "/dashboard/logging": ["owner"],
  "/dashboard/shift": ["owner", "cashier"],
}

// Root segments that belong to the app, not to the customer token route
const RESERVED_ROOT_SEGMENTS = new Set([
  "dashboard",
  "login",
  "reset-password",
  "api",
])

// Public pages that never need a session
const PUBLIC_ROUTES = ["/", "/login", "/reset-password"]

// Customer kiosk routes: /[tokenMeja], /[tokenMeja]/pesanan, /[tokenMeja]/checkout, ...
const CUSTOMER_TOKEN_PATTERN = /^[a-zA-Z0-9-]+$/
const CUSTOMER_SUBPATH_PATTERN =
  /^(pesanan|checkout|pembayaran|pembayaran-langkah)(\/.*)?$/

function isRoleUser(value: unknown): value is RoleUser {
  return (
    typeof value === "string" &&
    (ALL_ROLES as readonly string[]).includes(value)
  )
}

function getRouteRole(pathname: string): RoleUser[] | null {
  // Exact match first
  if (roleRouteAccess[pathname]) return roleRouteAccess[pathname]

  // Prefix match, longest route wins (e.g. /dashboard/kasir/pesanan-baru/456
  // -> /dashboard/kasir, not /dashboard)
  let matched: string | null = null
  for (const route of Object.keys(roleRouteAccess)) {
    if (!pathname.startsWith(route + "/")) continue
    if (matched === null || route.length > matched.length) {
      matched = route
    }
  }

  return matched ? roleRouteAccess[matched] : null
}

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (/^\/reset-password\/[^/]+$/.test(pathname)) return true

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return false

  const [root, ...rest] = segments
  if (RESERVED_ROOT_SEGMENTS.has(root)) return false
  if (!CUSTOMER_TOKEN_PATTERN.test(root)) return false

  return rest.length === 0 || CUSTOMER_SUBPATH_PATTERN.test(rest.join("/"))
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const session = await auth()
  const isLoggedIn = !!session?.user
  const rawRole = session?.user?.role
  const userRole: RoleUser | undefined = isRoleUser(rawRole) ? rawRole : undefined
  const hasValidRole = userRole !== undefined

  // Belum login dan bukan route publik -> ke halaman login
  if (!isLoggedIn && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Sudah login dengan role valid -> akses /login dialihkan ke dashboard
  if (isLoggedIn && hasValidRole && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Role-based access: cek apakah user punya akses ke route ini
  const allowedRoles = getRouteRole(pathname)
  if (allowedRoles) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Role tidak dikenal atau tidak punya akses -> keluar dari dashboard
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
}
