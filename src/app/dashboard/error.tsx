"use client";

import { KoneksiErrorFallback } from "@/components/layout/KoneksiErrorFallback";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <KoneksiErrorFallback
      error={error}
      unstable_retry={unstable_retry}
      konteks="Gagal memuat halaman dashboard. Pastikan koneksi internet tetap stabil saat menggunakan kasir, pesanan, meja, atau stok."
    />
  );
}
