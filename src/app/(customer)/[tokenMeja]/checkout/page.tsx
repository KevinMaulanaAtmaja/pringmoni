"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wallet, Banknote, ArrowLeft, CreditCard, Smartphone } from "lucide-react";

interface CheckoutItem {
  id: number;
  namaMenu: string;
  harga: number;
  jumlah: number;
  catatan?: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  subtotal: number;
  voucher: {
    kode: string;
    potongan: number;
    minPembelian: number;
  } | null;
  total: number;
  mejaToken: string;
  waktu: string;
}

type MetodeBayar = "tunai" | "qris" | "debit" | "kredit";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const tokenMeja = params.tokenMeja as string;
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("checkoutData");
    return saved ? JSON.parse(saved) : null;
  });
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar | null>(null);
  const [jumlahBayar, setJumlahBayar] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!checkoutData) {
      router.push(`/${tokenMeja}`);
    }
  }, [checkoutData, router, tokenMeja]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const { items, subtotal = 0, voucher, total = 0 } = checkoutData;
  const jumlahBayarNum = parseInt(jumlahBayar) || 0;
  const kembalian = jumlahBayarNum - total;
  const canBayar = metodeBayar === "qris" || metodeBayar === "debit" || metodeBayar === "kredit" || (metodeBayar === "tunai" && jumlahBayarNum >= total);

  const metodeOptions: { value: MetodeBayar; label: string; icon: React.ReactNode }[] = [
    { value: "tunai", label: "Tunai", icon: <Banknote className="size-5" /> },
    { value: "qris", label: "QRIS", icon: <Smartphone className="size-5" /> },
    { value: "debit", label: "Debit", icon: <CreditCard className="size-5" /> },
    { value: "kredit", label: "Kredit", icon: <CreditCard className="size-5" /> },
  ];

  const handleBayar = () => {
    if (!canBayar) return;

    const pesanan = {
      id: Date.now().toString(),
      items,
      subtotal,
      voucher,
      total,
      metodeBayar,
      jumlahBayar: metodeBayar === "tunai" ? jumlahBayarNum : null,
      kembalian: metodeBayar === "tunai" ? kembalian : null,
      status: "menunggu" as const,
      waktu: new Date(),
    };
    localStorage.setItem("lastPesanan", JSON.stringify(pesanan));
    localStorage.removeItem("checkoutData");
    setShowSuccess(true);

    setTimeout(() => {
      router.push(`/${tokenMeja}/pesanan`);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h2 className="font-bold text-lg mb-2">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground text-sm text-center mb-4">
              Silakan lakukan pembayaran ke kasir
            </p>
            <p className="text-2xl font-bold text-primary">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
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
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.jumlah}x {item.namaMenu}</span>
                  <span className="font-medium">
                    Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              {voucher && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Voucher ({voucher.kode})</span>
                  <span>-Rp {voucher.potongan.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-lg text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
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
                  onClick={() => setMetodeBayar(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    metodeBayar === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  {opt.icon}
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {metodeBayar === "tunai" && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Jumlah Bayar (Rp)
                </label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah uang"
                  value={jumlahBayar}
                  onChange={(e) => setJumlahBayar(e.target.value)}
                  className="text-lg"
                />
              </div>
              {jumlahBayarNum > 0 && (
                <div className="space-y-2">
                  {jumlahBayarNum < total ? (
                    <Badge variant="destructive" className="w-full justify-center py-2">
                      Jumlah bayar kurang Rp {(total - jumlahBayarNum).toLocaleString("id-ID")}
                    </Badge>
                  ) : (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
                      <span className="text-sm text-green-700">Kembalian</span>
                      <span className="text-lg font-bold text-green-700">
                        Rp {kembalian.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {metodeBayar && metodeBayar !== "tunai" && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="size-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">
                  {metodeBayar === "qris" && "Pembayaran via QRIS"}
                  {metodeBayar === "debit" && "Pembayaran via Debit"}
                  {metodeBayar === "kredit" && "Pembayaran via Kredit"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Selesaikan pembayaran di kasir
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pt-4 pb-8">
          <Button
            className="w-full h-14 rounded-full text-lg font-bold"
            disabled={!canBayar}
            onClick={handleBayar}
          >
            Bayar Rp {total.toLocaleString("id-ID")}
          </Button>
        </div>
      </main>
    </div>
  );
}