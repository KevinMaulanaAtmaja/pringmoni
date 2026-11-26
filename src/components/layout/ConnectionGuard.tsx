"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EVENT_KONEKSI_PUTUS, apakahErrorJaringan } from "@/lib/koneksi";

const PESAN_DEFAULT =
  "Tidak dapat terhubung ke server. Periksa koneksi Wi-Fi atau data Anda, lalu coba lagi.";

export function ConnectionGuard() {
  const pathname = usePathname();
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );
  const [alasan, setAlasan] = useState<string | null>(null);
  const [ditutupUntuk, setDitutupUntuk] = useState<string | null>(null);
  const [sedangMencoba, setSedangMencoba] = useState(false);

  const putus = (offline || alasan !== null) && ditutupUntuk !== pathname;
  const putusRef = useRef(putus);

  useEffect(() => {
    putusRef.current = putus;
  }, [putus]);

  const buka = useCallback((pesan?: string) => {
    setDitutupUntuk(null);
    setAlasan(pesan || PESAN_DEFAULT);
  }, []);

  const tutup = useCallback(() => {
    setAlasan(null);
    setDitutupUntuk(pathname);
  }, [pathname]);

  useEffect(() => {
    const saatOffline = () => {
      setOffline(true);
      buka(PESAN_DEFAULT);
    };
    const saatOnline = () => {
      setOffline(false);
      if (!putusRef.current) return;
      setAlasan(null);
      window.location.reload();
    };
    const saatLaporan = (event: Event) => {
      const pesan = (event as CustomEvent<string | undefined>).detail;
      buka(pesan || PESAN_DEFAULT);
    };
    const saatError = (event: ErrorEvent) => {
      if (apakahErrorJaringan(event.error ?? event.message)) buka(PESAN_DEFAULT);
    };
    const saatRejection = (event: PromiseRejectionEvent) => {
      if (apakahErrorJaringan(event.reason)) buka(PESAN_DEFAULT);
    };

    window.addEventListener("offline", saatOffline);
    window.addEventListener("online", saatOnline);
    window.addEventListener(EVENT_KONEKSI_PUTUS, saatLaporan);
    window.addEventListener("error", saatError);
    window.addEventListener("unhandledrejection", saatRejection);

    return () => {
      window.removeEventListener("offline", saatOffline);
      window.removeEventListener("online", saatOnline);
      window.removeEventListener(EVENT_KONEKSI_PUTUS, saatLaporan);
      window.removeEventListener("error", saatError);
      window.removeEventListener("unhandledrejection", saatRejection);
    };
  }, [buka]);

  const cobaLagi = () => {
    setSedangMencoba(true);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setDitutupUntuk(null);
      setAlasan("Koneksi masih terputus. Periksa Wi-Fi atau data Anda lalu coba lagi.");
      setSedangMencoba(false);
      return;
    }
    setOffline(false);
    setAlasan(null);
    window.location.reload();
  };

  return (
    <Dialog open={putus} onOpenChange={(bukaDialog) => { if (!bukaDialog) tutup(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm gap-5 text-center"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <WifiOff className="size-7" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="size-5 text-destructive" />
            Koneksi Terputus
          </DialogTitle>
          <DialogDescription>{alasan ?? PESAN_DEFAULT}</DialogDescription>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Data yang belum tersimpan mungkin perlu diisi ulang setelah koneksi kembali.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={tutup}>
            Tutup Sementara
          </Button>
          <Button onClick={cobaLagi} disabled={sedangMencoba}>
            <RotateCcw className="size-4 mr-2" />
            {sedangMencoba ? "Memeriksa..." : "Coba Lagi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
