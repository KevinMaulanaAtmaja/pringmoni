import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  const cookies = request.cookies.getAll()
  const cookieNames = cookies.map(c => c.name)

  const isLoggedIn = cookieNames.some(name => 
    name.includes('next-auth') || 
    name.includes('session-token') ||
    name.includes('authjs')
  )

  if (pathname === "/" || pathname === "/login" || pathname === "/reset-password") {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const isProtectedPath = 
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/menu") ||
      pathname.startsWith("/pesanan") ||
      pathname.startsWith("/kasir") ||
      pathname.startsWith("/meja")

    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}