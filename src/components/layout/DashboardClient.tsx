"use client"

import { useState, ReactNode } from "react"
import { Sidebar } from "./Sidebar"

interface DashboardClientProps {
  role?: string
  header: ReactNode
  children: ReactNode
}

export function DashboardClient({ role, header, children }: DashboardClientProps) {
  const [collapsed, setCollapsed] = useState(false)
  const marginLeft = collapsed ? "ml-20" : "ml-64"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 h-screen z-50">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>
      <main className={`flex-1 ${marginLeft} min-h-screen flex flex-col transition-all duration-300`}>
        <div className="sticky top-0 z-10 w-full border-b bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
          <div className="px-6 pt-6">
            {header}
          </div>
        </div>
        <div className="flex-1 px-6 pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}
