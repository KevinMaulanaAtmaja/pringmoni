import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ResepClient } from "@/components/dashboard/ResepClient"

export default async function ResepPage() {
  const session = await auth()
  if (!session || session.user.role !== 'owner') {
    redirect("/dashboard")
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-1">
        Resep Menu
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Rakit resep bahan per porsi. Stok bahan dapur otomatis berkurang saat
        pesanan menu terkait ditandai selesai.
      </p>
      <ResepClient />
    </div>
  )
}