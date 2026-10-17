"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrdersRealtime } from "@/hooks/use-orders-realtime"

export function DashboardRealtimeRefresh() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  useOrdersRealtime(() => router.refresh())

  return null
}