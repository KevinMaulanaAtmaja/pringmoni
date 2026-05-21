"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowLeft, Banknote, CreditCard, Smartphone, Loader2, AlertCircle, Clock } from "lucide-react";
import { getPesananForCheckout, updateNamaPelanggan, createMidtransPayment, konfirmasiPembayaranCustomer } from "@/app/actions/pesanan";
import { hitungAdminFee } from "@/lib/fee";

const BATAS_KONFIRMASI_MENIT = 60

interface CheckoutData {
  items: { id: number; namaMenu: string; harga: number; jumlah: number; catatan: string | null }[];
  subtotal: number;
  total: number;
  waktu: string;
}

const metodeOptions = [
  { value: "tunai", label: "Tunai", icon: <Banknote className="size-5" /> },
  { value: "transfer", label: "Transfer", icon: <CreditCard className="size-5" /> },
  { value: "qris", label: "QRIS", icon: <Smartphone className="size-5" /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;
  const orderId = searchParams.get("orderId");

  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [metode, setMetode] = useState<string | null>(null);
  const [sisaMenit, setSisaMenit] = useState<number>(BATAS_KONFIRMASI_MENIT);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID tidak ditemukan");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const result = await getPesananForCheckout(orderId);
        if (!result) {
          setError("Pesanan tidak ditemukan");
        } else {
          setData(result);
        }
      } catch {
        setError("Gagal memuat data pesanan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  useEffect(() => {
    if (!data?.waktu) return;
    const waktuDibuat = new Date(data.waktu).getTime();
    const updateCountdown = () => {
      const sisa = BATAS_KONFIRMASI_MENIT - (Date.now() - waktuDibuat) / 1000 / 60;
      setSisaMenit(Math.max(0, Math.round(sisa)));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [data?.waktu]);

  const handleLanjut = async () => {
    if (!nama.trim() || !metode || !orderId) return;

    setSubmitting(true);
    setSubmitError(null);

    await updateNamaPelanggan(orderId, tokenMeja, nama);

    if (metode === "tunai") {
      const result = await konfirmasiPembayaranCustomer(orderId, tokenMeja, metode);
      if (result.error) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }
      router.push(`/${tokenMeja}/pembayaran/${metode}?orderId=${orderId}&nama=${encodeURIComponent(nama)}&confirmed=1`);
      return;
    }

    try {
      const result = await createMidtransPayment(orderId, tokenMeja, metode as "qris" | "transfer");

      if (result.error) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }

      const params = new URLSearchParams({
        orderId,
        nama,
        transactionId: result.transaction_id || "",
      });

      if (result.payment_type === "bank_transfer" && result.va_number) {
        params.set("va", result.va_number);
      } else if (result.payment_type === "qris" && result.qr_url) {
        params.set("qrUrl", result.qr_url);
      }

      if (result.expiryMenit) {
        params.set("expiry", String(result.expiryMenit));
      }

      router.push(`/${tokenMeja}/pembayaran/${metode}?${params.toString()}`);
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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <h2 className="font-bold text-lg mb-2">Gagal Memuat Pesanan</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">{error || "Pesanan tidak ditemukan"}</p>
            <Button onClick={() => router.push(`/${tokenMeja}`)} variant="outline" className="rounded-full">
              Kembali ke Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="flex-1 text-center font-bold">Checkout</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
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

          {sisaMenit <= 15 && (
            <Card className={`border-2 ${sisaMenit <= 0 ? "border-destructive bg-destructive/5" : "border-orange-300 bg-orange-50"}`}>
              <CardContent className="p-3 flex items-center gap-2">
                <Clock className={`size-5 shrink-0 ${sisaMenit <= 0 ? "text-destructive" : "text-orange-600"}`} />
                <div>
                  <p className={`text-sm font-semibold ${sisaMenit <= 0 ? "text-destructive" : "text-orange-700"}`}>
                    {sisaMenit <= 0
                      ? "Waktu konfirmasi habis! Silakan hubungi kasir."
                      : `Sisa waktu konfirmasi: ${sisaMenit} menit`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pesanan akan dibatalkan otomatis jika tidak dikonfirmasi dalam {BATAS_KONFIRMASI_MENIT} menit
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Wallet className="size-5" />
              Metode Pembayaran
            </h3>
            <div className="grid grid-cols-3 gap-2">
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
                {metode !== "tunai" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Total Makanan</span>
                      <span>Rp {data.total.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Biaya Admin {metode === "transfer" ? "(flat)" : "(0.7%)"}</span>
                      <span>Rp {hitungAdminFee(metode as "transfer" | "qris", data.total).toLocaleString("id-ID")}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total Bayar</span>
                  <span className="text-primary">Rp {(data.total + (metode !== "tunai" ? hitungAdminFee(metode as "transfer" | "qris", data.total) : 0)).toLocaleString("id-ID")}</span>
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
            disabled={!nama.trim() || !metode || sisaMenit <= 0 || submitting}
            onClick={handleLanjut}
          >
            {submitting ? (
              <><Loader2 className="size-5 animate-spin mr-2" /> Memproses...</>
            ) : (
              "Lanjut ke Pembayaran"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
