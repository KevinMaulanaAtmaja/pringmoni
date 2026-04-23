"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/actions/logout"
import { 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed, 
  Sofa, 
  Receipt, 
  LogOut,
  Users 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RoleUser } from "@/types"

interface SidebarProps {
  role?: RoleUser
}

const ownerNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/users", label: "Akun", icon: Users },
  { href: "/meja", label: "Meja", icon: Sofa },
  { href: "/kasir", label: "Kasir", icon: Receipt },
]

const cashierNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
  { href: "/kasir", label: "Kasir", icon: Receipt },
]

const waiterNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  const navItems = role === 'waiter' ? waiterNav : role === 'cashier' ? cashierNav : ownerNav

  return (
    <aside className="w-64 bg-green-700 text-white p-4 flex flex-col h-screen sticky top-0">
      <div className="mb-6">
        <img 
          src="/logo-pringmoni.jpeg" 
          alt="Logo Pringmoni" 
          className="h-12 w-auto object-contain"
        />
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-lg transition",
                isActive 
                  ? "bg-white/20 text-white" 
                  : "hover:bg-green-600 text-white/80 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-green-600">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-green-600"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  )
}
