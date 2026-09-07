"use client"

import { useState, ReactNode, useEffect, useCallback } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "./Sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  User,
  Armchair,
  Receipt,
  ShoppingCart,
  BarChart3,
  ScrollText,
} from "lucide-react"
import { cn } from "@/lib/utils"

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])
  return matches
}

interface DashboardClientProps {
  role?: string
  header: ReactNode
  children: ReactNode
}

export function DashboardClient({ role, header, children }: DashboardClientProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const marginLeft = collapsed ? "ml-0 md:ml-20 lg:ml-20" : "ml-0 md:ml-20 lg:ml-64"

  const handleMobileToggle = useCallback(() => setMobileOpen((p) => !p), [])
  const handleMobileClose = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar drawer (hanya di layar kecil) */}
      {!isDesktop && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="!w-72 p-0 bg-transparent border-0 [&>button]:hidden"
          >
            <SidebarMobile role={role} onClose={handleMobileClose} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-screen z-50">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>

      <main className={`flex-1 ${marginLeft} min-h-screen flex flex-col transition-all duration-300`}>
        <div className="sticky top-0 z-10 w-full border-b bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
          <div className="px-4 md:px-6 pt-4 md:pt-6 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 h-9 w-9"
              onClick={handleMobileToggle}
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {header}
          </div>
        </div>
        <div className="flex-1 px-4 md:px-6 pb-4 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}

/* ─── Mobile Sidebar (inside Sheet) ─────────────────────────── */

function SidebarMobile({ role, onClose }: { role?: string; onClose: () => void }) {
  const pathname = usePathname()

  const navItems = (role === 'waiter')
    ? [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Pesanan", icon: ClipboardList, href: "/dashboard/pesanan" },
      ]
    : (role === 'cashier')
    ? [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Pesanan", icon: ClipboardList, href: "/dashboard/pesanan" },
        { name: "Buat Pesanan", icon: ShoppingCart, href: "/dashboard/kasir/pesanan-baru" },
        { name: "Kasir", icon: Receipt, href: "/dashboard/kasir" },
      ]
    : [
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Pesanan", icon: ClipboardList, href: "/dashboard/pesanan" },
        { name: "Menu", icon: UtensilsCrossed, href: "/dashboard/menu" },
        { name: "Meja", icon: Armchair, href: "/dashboard/meja" },
        { name: "Akun", icon: User, href: "/dashboard/users" },
        { name: "Logging", icon: ScrollText, href: "/dashboard/logging" },
        { name: "Laporan", icon: BarChart3, href: "/dashboard/laporan" },
      ]

  return (
    <div className="h-screen bg-gradient-to-br from-green-700 to-green-900 text-white flex flex-col p-4 overflow-hidden shadow-2xl">
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
            PM
          </div>
          <div className="overflow-hidden flex-1">
            <h1 className="text-lg font-semibold whitespace-nowrap">PringMoni</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || (
                  pathname.startsWith(item.href + '/') &&
                  !navItems.some(other =>
                    other.href !== item.href &&
                    other.href.startsWith(item.href + '/') &&
                    pathname.startsWith(other.href)
                  )
                )
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  isActive
                    ? "bg-green-400/20 shadow-md backdrop-blur-md text-white"
                    : "hover:bg-white/10 text-white/90"
                )}
              >
                <div className={cn("p-2.5 rounded-lg shrink-0",
                  isActive ? "bg-green-400/30" : "bg-white/10")}>
                  <Icon size={18} />
                </div>
                <span className="text-base whitespace-nowrap overflow-hidden">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
