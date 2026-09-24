"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowLeft, Banknote, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { createPesanan } from "@/app/actions/pesanan";
import { ambilKeranjangCheckout, hapusKeranjangCheckout } from "@/lib/checkout-storage";

interface CheckoutData {
  items: { id: number; namaMenu: string; harga: number; jumlah: number; catatan: string | null }[];
  subtotal: number;
  total: number;
}

interface CreatePesananResult {
  success?: boolean;
  orderId?: string | null;
  id?: number;
  error?: string;
}

const metodeOptions = [
  { value: "tunai", label: "Tunai", icon: <Banknote className="size-5" /> },
  { value: "qris", label: "QRIS", icon: <CreditCard className="size-5" /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const tokenMeja = params.tokenMeja as string;

  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [metode, setMetode] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const items = ambilKeranjangCheckout();
      if (!items || items.length === 0) {
        setData(null);
        setLoading(false);
        return;
      }
      const subtotal = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
      setData({ items, subtotal, total: subtotal });
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const goToMenu = useCallback(() => {
    router.replace(`/${tokenMeja}`);
  }, [tokenMeja, router]);

  useEffect(() => {
    const handlePopState = () => {
      setTimeout(goToMenu, 0);
    };
    window.history.pushState({ checkoutGuard: true }, "");
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [goToMenu]);

  const handleKonfirmasi = async () => {
    if (!nama.trim() || !metode || !data) return;

    setSubmitting(true);
    setSubmitError(null);

    const items = data.items.map((item) => ({
      menuId: item.id,
      jumlah: item.jumlah,
      catatan: item.catatan,
    }));

    try {
      const result: CreatePesananResult = await createPesanan({
        tokenMeja,
        items,
        namaPelanggan: nama.trim(),
        metodePembayaran: metode,
      });

      if (result && 'error' in result) {
        setSubmitError(result.error ?? "Gagal membuat pesanan. Silakan coba lagi.");
        setSubmitting(false);
        return;
      }

      if (!result?.orderId) {
        setSubmitError("Gagal membuat pesanan. Silakan coba lagi.");
        setSubmitting(false);
        return;
      }

      hapusKeranjangCheckout();
      setSubmitting(false);

      if (metode === "tunai") {
        router.push(`/${tokenMeja}/pembayaran/${metode}?orderId=${result.orderId}&confirmed=1`);
      } else {
        router.push(`/${tokenMeja}/pembayaran/${metode}?orderId=${result.orderId}`);
      }
    } catch {
      setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <h2 className="font-bold text-lg mb-2">Keranjang Kosong</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Tidak ada item yang dimuat untuk checkout. Silakan pilih menu terlebih dahulu.
            </p>
            <Button onClick={goToMenu} variant="outline" className="rounded-full">
              Kembali ke Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl md:max-w-3xl mx-auto flex h-14 items-center px-4">
          <button onClick={goToMenu} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="flex-1 text-center font-bold">Checkout</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl md:max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2">
              {data.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.jumlah}x {item.namaMenu}</span>
                  <span className="font-medium">Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">Rp {data.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <label htmlFor="nama" className="text-sm font-medium">Nama Pelanggan</label>
              <input
                id="nama"
                type="text"
                placeholder="Masukkan nama Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">*Nama pelanggan wajib diisi</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Wallet className="size-5" />
              Metode Pembayaran
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {metodeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMetode(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    metode === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  {opt.icon}
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            {metode && (
              <div className="mt-4 border-t pt-4 space-y-1">
                <div className="flex justify-between font-bold text-base">
                  <span>Total Bayar</span>
                  <span className="text-primary">Rp {data.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {submitError && (
          <Card className="border-destructive">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{submitError}</p>
            </CardContent>
          </Card>
        )}

        <div className="pt-4 pb-8">
          <Button
            className="w-full h-14 rounded-full text-lg font-bold"
            disabled={!nama.trim() || !metode || submitting}
            onClick={handleKonfirmasi}
          >
            {submitting ? (
              <><Loader2 className="size-5 animate-spin mr-2" /> Memproses...</>
            ) : (
              "Konfirmasi Pembayaran"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}