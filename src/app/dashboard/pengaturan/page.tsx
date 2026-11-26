import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPengaturan, updateExpiryJam } from "@/app/actions/pengaturan"
import type { RoleUser } from "@/types"

export default async function PengaturanPage() {
  const session = await auth()
  const role = session?.user?.role as RoleUser | undefined

  if (!session || role !== "owner") {
    redirect("/login")
  }

  const expiryJamRaw = await getPengaturan("reservasi_expiry_jam")
  const expiryJam = expiryJamRaw ?? "3"

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Sistem</h1>

      <form
        action={async (fd: FormData) => {
          await updateExpiryJam(fd)
        }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
          <label htmlFor="expiryJam" className="font-medium">
            Batas konfirmasi reservasi
          </label>
          <input
            id="expiryJam"
            name="expiryJam"
            type="number"
            min="1"
            max="48"
            defaultValue={expiryJam}
            className="w-20 border rounded px-2 py-1"
          />
          <span className="text-sm text-muted-foreground">
            jam setelah waktu kedatangan (default 3 jam)
          </span>
        </div>

        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Simpan
        </button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Berlaku untuk reservasi baru dan pengecekan expiry otomatis via cron.
        Diperbarui secara langsung ke database.
      </p>
    </div>
  )
}
