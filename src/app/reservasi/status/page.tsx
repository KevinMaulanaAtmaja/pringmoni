import { redirect } from "next/navigation"
import { LINK_RESERVASI_PUBLIK } from "@/lib/reservasi-akses"

export default function StatusReservasiPage() {
  redirect(`${LINK_RESERVASI_PUBLIK}/cek`)
}
