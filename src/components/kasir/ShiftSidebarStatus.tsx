"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { LockKeyhole, Wallet } from "lucide-react"
import { getShiftAktif } from "@/app/actions/shift"
import type { ShiftAktif } from "@/types"

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`

function jamLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Indikator status shift kasir untuk sidebar.
 *
 * Kasir bisa langsung tahu dari halaman mana pun apakah shiftnya masih aktif,
 * supaya tidak ada yang mulai bertransaksi tanpa membuka shift. Hanya dirender
 * untuk role kasir.
 */
export function ShiftSidebarStatus({ collapsed }: { collapsed?: boolean }) {
  const [shift, setShift] = useState<ShiftAktif | null>(null)
  const [sudahMuat, setSudahMuat] = useState(false)

  const muat = useCallback(async () => {
    try {
      const hasil = await getShiftAktif()
      setShift('error' in hasil ? null : hasil.shift)
    } catch {
      setShift(null)
    } finally {
      setSudahMuat(true)
    }
  }, [])

  useEffect(() => {
    muat()
    const interval = setInterval(muat, 30000)
    return () => clearInterval(interval)
  }, [muat])

  if (!sudahMuat) return null

  const aktif = Boolean(shift)

  if (collapsed) {
    return (
      <Link
        href="/dashboard/kasir"
        title={aktif ? `Shift aktif sejak ${jamLabel(shift!.waktuMasuk)}` : "Shift belum dibuka"}
        className={`mt-4 flex items-center justify-center p-2.5 rounded-xl transition-all shrink-0 ${
          aktif
            ? "bg-green-400/20 text-green-100 hover:bg-green-400/30"
            : "bg-amber-500/25 text-amber-100 hover:bg-amber-500/40"
        }`}
      >
        {aktif ? <Wallet size={18} /> : <LockKeyhole size={18} />}
      </Link>
    )
  }

  return (
    <Link
      href="/dashboard/kasir"
      className={`mt-4 flex items-start gap-3 p-3 rounded-xl transition-all shrink-0 ${
        aktif
          ? "bg-green-400/20 hover:bg-green-400/30"
          : "bg-amber-500/25 hover:bg-amber-500/40"
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
          aktif ? "bg-green-300 animate-pulse" : "bg-amber-300"
        }`}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white whitespace-nowrap">
          {aktif ? "Shift Aktif" : "Shift Belum Dibuka"}
        </span>
        <span className="block text-xs text-white/70 mt-0.5">
          {aktif ? (
            <>
              Masuk {jamLabel(shift!.waktuMasuk)} · {shift!.totalTransaksi} transaksi
            </>
          ) : (
            "Buka shift dulu"
          )}
        </span>
        {aktif && (
          <span className="block text-xs text-white/80 mt-0.5 whitespace-nowrap">
            Modal {rupiah(shift!.uangAwal)}
          </span>
        )}
      </span>
    </Link>
  )
}