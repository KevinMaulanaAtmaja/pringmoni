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
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role?: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  // Note: RoleUser type in @/types/index.ts: 'owner' | 'admin' | 'kasir' | 'waiter'
  const navItems = (role === 'waiter')
    ? [
        // Waiter: Kelola pesanan saja (Menu tidak perlu, bisa lihat customer page kalau ada yg tanyain)
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Pesanan", icon: ClipboardList, href: "/dashboard/pesanan" },
      ]
    : (role === 'cashier')
    ? [
        // Kasir: Proses pembayaran + bisa buat pesanan manual (butuh lihat menu)
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Pesanan", icon: ClipboardList, href: "/dashboard/pesanan" },
        { name: "Kasir", icon: Receipt, href: "/dashboard/kasir" },
      ]
    : [
        // Owner: Full access
        { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Pesanan", icon: ClipboardList, href: "/dashboard/pesanan" },
        { name: "Kasir", icon: Receipt, href: "/dashboard/kasir" },
        { name: "Menu", icon: UtensilsCrossed, href: "/dashboard/menu" },
        { name: "Meja", icon: Armchair, href: "/dashboard/meja" },
        { name: "Akun", icon: User, href: "/dashboard/users" },
      ]

  return (
    <div className="w-64 h-screen bg-gradient-to-br from-green-700 to-green-900 text-white flex flex-col p-4 overflow-hidden rounded-r-2xl shadow-2xl">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-green-700 font-bold text-lg">PM</div>
          <div>
            <h1 className="text-lg font-semibold">PringMoni</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.name} href={item.href}
                className={cn("flex items-center gap-3 p-3 rounded-xl transition-all",
                  isActive ? "bg-green-400/20 shadow-md backdrop-blur-md text-white" : "hover:bg-white/10 text-white/90")}>
                <div className={cn("p-2.5 rounded-lg",
                  isActive ? "bg-green-400/30" : "bg-white/10")}>
                  <Icon size={18} />
                </div>
                <span className="text-base">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
