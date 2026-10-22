"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LaporanClient } from "@/components/dashboard/LaporanClient"
import { useUserRole } from "@/lib/user-context"

export default function LaporanPage() {
  const role = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (role && role !== "owner") {
      router.replace("/dashboard")
    }
  }, [role, router])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Laporan &amp; Analitik</h1>
      <LaporanClient />
    </div>
  )
}