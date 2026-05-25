"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Clock, ChefHat, PackageCheck, Banknote, CreditCard, Smartphone, Loader2, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getPesananByTokenAndId, checkMidtransPaymentStatus } from "@/app/actions/pesanan";

import type { LucideIcon } from "lucide-react";

type StatusPesanan = "menunggu" | "diproses" | "selesai" | "dibatalkan";

interface PesananData {
  id: number;
  midtransOrderId: string | null;
  items: { id: number; detailId: number; namaMenu: string; harga: number; jumlah: number; catatan: string | null; statusAntar: string; fotoUrl: string | null }[];
  subtotal: number;
  adminFee: number;
  ppn: number;
  total: number;
  status: string;
  statusPembayaran: string;
  waktu: string;
  namaPelanggan: string | null;
  metodePembayaran: string | null;
  nomorMeja: string;
}

const metodeConfig: Record<string, { label: string; icon: LucideIcon }> = {
  tunai: { label: "Tunai", icon: Banknote },
  transfer: { label: "Transfer", icon: CreditCard },
  qris: { label: "QRIS", icon: Smartphone },
};

export default function DetailPesananPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;
  const orderIdParam = searchParams.get("orderId") || "";

  const [pesanan, setPesanan] = useState<PesananData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKembaliDialog, setShowKembaliDialog] = useState(false);

  const fetchPesanan = useCallback(async () => {
    if (!orderIdParam) {
      setError("ID pesanan tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      const data = await getPesananByTokenAndId(tokenMeja, orderIdParam);
      if (!data) {
        setError("Pesanan tidak ditemukan");
      } else {
        setPesanan(data);
      }
    } catch {
      setError("Gagal memuat data pesanan");
    } finally {
      setLoading(false);
    }
  }, [tokenMeja, orderIdParam]);

  useEffect(() => {
    fetchPesanan();
  }, [fetchPesanan]);

  useEffect(() => {
    if (!pesanan || pesanan.status === "selesai" || pesanan.status === "dibatalkan") return;
    const interval = setInterval(fetchPesanan, 5000);
    return () => clearInterval(interval);
  }, [pesanan, fetchPesanan]);

  useEffect(() => {
    if (!pesanan || pesanan.statusPembayaran !== "menunggu") return;
    const metodeParam = pesanan.metodePembayaran;
    if (metodeParam !== "qris" && metodeParam !== "transfer") return;

    const check = async () => {
      if (!pesanan.midtransOrderId) return;
      const result = await checkMidtransPaymentStatus(pesanan.midtransOrderId);
      if (result.isSuccess) {
        fetchPesanan();
      }
    };
    const timer = setTimeout(check, 2000);
    return () => clearTimeout(timer);
  }, [pesanan?.id, pesanan?.statusPembayaran, searchParams]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pesanan && (pesanan.status === "menunggu" || pesanan.status === "diproses")) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pesanan]);

  const handleKembali = () => {
    if (pesanan && (pesanan.status === "menunggu" || pesanan.status === "diproses")) {
      setShowKembaliDialog(true);
    } else {
      router.push(`/${tokenMeja}`);
    }
  };

  const confirmKembali = () => {
    setShowKembaliDialog(false);
    router.push(`/${tokenMeja}`);
  };

  const metodeKey = (pesanan?.metodePembayaran || "tunai") as string;
  const metode = metodeConfig[metodeKey] || metodeConfig.tunai;
  const MetodeIcon = metode.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !pesanan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <h2 className="font-bold text-lg mb-2">Pesanan Tidak Ditemukan</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">{error || "Pesanan tidak ditemukan"}</p>
            <Button onClick={() => router.push(`/${tokenMeja}`)} variant="outline" className="rounded-full">
              Kembali ke Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = pesanan.status as StatusPesanan;

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <button onClick={handleKembali} className="text-muted-foreground hover:text-foreground">
            Kembali
          </button>
          <h1 className="flex-1 text-center font-bold">Status Pesanan</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {status === "menunggu" && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="size-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Pesanan Tercatat</p>
                <p className="text-sm text-green-600">Pesananmu akan segera diproses</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">No. Pesanan</p>
              <p className="font-mono font-bold text-xl">#{orderIdParam.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <p className="text-sm">
                <span className="text-muted-foreground">Meja: </span>
                <span className="font-medium">{pesanan.nomorMeja}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Pelanggan: </span>
                <span className="font-medium">{pesanan.namaPelanggan || "-"}</span>
              </p>
              {metodeKey && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Metode: </span>
                  <MetodeIcon className="size-3.5 inline mr-1 text-muted-foreground" />
                  <span className="font-medium">{metode.label}</span>
                </p>
              )}
              <p className="text-sm">
                <span className="text-muted-foreground">Pembayaran: </span>
                <Badge variant={
                  pesanan.statusPembayaran === "berhasil" ? "default" :
                  pesanan.statusPembayaran === "dibatalkan" ? "destructive" : "outline"
                } className="text-xs ml-1">
                  {pesanan.statusPembayaran === "berhasil" && "✓ Lunas"}
                  {pesanan.statusPembayaran === "menunggu" && "Menunggu"}
                  {pesanan.statusPembayaran === "dibatalkan" && "Dibatalkan"}
                </Badge>
              </p>
            </div>

            {status === "dibatalkan" ? (
              <div className="flex flex-col items-center gap-2 mt-6 py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                  <AlertCircle className="size-7" />
                </div>
                <p className="font-bold text-red-600">Dibatalkan</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Jika ini merupakan kesalahan, silahkan hubungi kasir untuk informasi lebih lanjut.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-6">
                {["menunggu", "diproses", "selesai"].map((step, index) => {
                  const isActive = status === step;
                  const stepIndex = ["menunggu", "diproses", "selesai"].indexOf(status);
                  const isPast = stepIndex > index;

                  const getStepIcon = (s: string) => {
                    if (s === "menunggu") return Clock;
                    if (s === "diproses") return ChefHat;
                    return PackageCheck;
                  };

                  const StepIcon = getStepIcon(step);

                  const colorMap: Record<string, string> = {
                    menunggu: "bg-yellow-500 text-white",
                    diproses: "bg-blue-100 text-blue-700",
                    selesai: "bg-green-500 text-white",
                  }

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? colorMap[step] : isPast ? "bg-gray-200 text-gray-400" : "bg-muted"
                      }`}>
                        <StepIcon className="size-5" />
                      </div>
                      <p className={`text-xs mt-2 ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
                        {step === "menunggu" ? "Menunggu" : step === "diproses" ? "Diproses" : "Selesai"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Item Pesanan</h3>
              <p className="text-xs text-green-600"><CheckCircle2 className="size-3 inline mr-0.5" /> centang = sudah diantar</p>
            </div>
            <div className="space-y-3">
              {pesanan.items.map((item, index) => {
                const isDiantar = item.statusAntar === "diantar"
                return (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1 flex items-start gap-2">
                      {isDiantar && (
                        <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className={`font-medium ${isDiantar ? "line-through text-muted-foreground" : ""}`}>
                          {item.jumlah}x {item.namaMenu}
                        </p>
                        {item.catatan && (
                          <p className={`text-xs mt-1 ${isDiantar ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                            {item.catatan}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className={`font-semibold ${isDiantar ? "line-through text-muted-foreground" : ""}`}>
                      Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="border-t mt-4 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Subtotal</p>
                <p>Rp {pesanan.subtotal.toLocaleString("id-ID")}</p>
              </div>
              {(pesanan.metodePembayaran && pesanan.metodePembayaran !== "tunai") && (
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">Biaya Admin</p>
                  <p>Rp {pesanan.adminFee.toLocaleString("id-ID")}</p>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">PPN (0%)</p>
                <p>Rp {pesanan.ppn.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1.5 border-t">
                <p>Total</p>
                <p className="text-primary">Rp {pesanan.total.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </CardContent>
        </Card>


      </main>

      <Dialog open={showKembaliDialog} onOpenChange={setShowKembaliDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5 text-yellow-600" />
              </div>
              <div>
                <DialogTitle>Tinggalkan Halaman?</DialogTitle>
                <DialogDescription>
                  Pesanan tidak bisa dilacak jika halaman ini ditutup. 
                  Simpan nomor pesanan #{orderIdParam.slice(0, 8).toUpperCase()} sebelum kembali ke menu.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowKembaliDialog(false)} className="flex-1">
              Tetap di Sini
            </Button>
            <Button variant="destructive" onClick={confirmKembali} className="flex-1">
              Tetap Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
