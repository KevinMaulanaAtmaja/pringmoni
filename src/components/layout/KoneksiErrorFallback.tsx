"use client";

import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apakahErrorJaringan } from "@/lib/koneksi";

interface KoneksiErrorFallbackProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
  konteks?: string;
}

export function KoneksiErrorFallback({
  error,
  unstable_retry,
  konteks,
}: KoneksiErrorFallbackProps) {
  const jaringan = apakahErrorJaringan(error);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/40">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            {jaringan ? <WifiOff className="size-7" /> : <AlertTriangle className="size-7" />}
          </div>
          <div className="space-y-1.5">
            <h2 className="font-heading text-lg font-semibold">
              {jaringan ? "Koneksi Terputus" : "Terjadi Kesalahan"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {jaringan
                ? "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi."
                : "Halaman gagal dimuat. Silakan coba lagi beberapa saat."}
            </p>
            {konteks && <p className="text-xs text-muted-foreground">{konteks}</p>}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Muat Ulang
            </Button>
            <Button onClick={unstable_retry}>
              <RotateCcw className="size-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
