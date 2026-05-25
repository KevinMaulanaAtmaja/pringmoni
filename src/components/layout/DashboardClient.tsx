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
      <main className={`flex-1 ${marginLeft} p-6 flex flex-col min-h-0 transition-all duration-300`}>
        {header}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}
