import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LaporanClient } from "@/components/dashboard/LaporanClient"

export default async function LaporanPage() {
  const session = await auth()
  if (!session || session.user.role !== 'owner') {
    redirect("/dashboard")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Laporan & Analitik</h1>
      <LaporanClient />
    </div>
  )
}
