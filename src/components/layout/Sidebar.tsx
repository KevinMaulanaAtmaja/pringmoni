"use client"

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
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role?: string
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
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
        { name: "Stok Bahan", icon: Boxes, href: "/dashboard/stok-bahan" },
        { name: "Meja", icon: Armchair, href: "/dashboard/meja" },
        { name: "Akun", icon: User, href: "/dashboard/users" },
        { name: "Logging", icon: ScrollText, href: "/dashboard/logging" },
        { name: "Laporan", icon: BarChart3, href: "/dashboard/laporan" },
      ]

  return (
    <div className={cn(
      "h-screen bg-gradient-to-br from-green-700 to-green-900 text-white flex flex-col p-4 overflow-hidden rounded-r-2xl shadow-2xl transition-all duration-300",
      collapsed ? "w-20 items-center" : "w-64"
    )}>
      <div className={cn("flex flex-col", collapsed ? "items-center" : "w-full")}>
        <div className={cn("flex items-center gap-3 mb-6", collapsed && "flex-col")}>
          <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
            PM
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <h1 className="text-lg font-semibold whitespace-nowrap">PringMoni</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-lg transition-all hover:bg-white/20 text-white/90 hover:text-white shrink-0 bg-white/10",
              collapsed && "mt-2"
            )}
            title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={22} strokeWidth={2.5} /> : <PanelLeftClose size={22} strokeWidth={2.5} />}
          </button>
        </div>

        <nav className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
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
              <Link key={item.name} href={item.href}
                className={cn("flex items-center gap-3 p-3 rounded-xl transition-all",
                  collapsed && "justify-center p-2.5",
                  isActive
                    ? "bg-green-400/20 shadow-md backdrop-blur-md text-white"
                    : "hover:bg-white/10 text-white/90"
                )}
                title={collapsed ? item.name : undefined}
              >
                <div className={cn("p-2.5 rounded-lg shrink-0",
                  isActive ? "bg-green-400/30" : "bg-white/10")}>
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <span className="text-base whitespace-nowrap overflow-hidden">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>


    </div>
  )
}
