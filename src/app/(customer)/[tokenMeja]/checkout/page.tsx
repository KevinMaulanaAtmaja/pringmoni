"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Wallet, ArrowLeft, Banknote, CreditCard, Smartphone, Copy, QrCode, Barcode } from "lucide-react";

const total = 60000;
const orderId = "001";

const metodeOptions = [
  { value: "tunai", label: "Tunai", icon: <Banknote className="size-5" /> },
  { value: "transfer", label: "Transfer", icon: <CreditCard className="size-5" /> },
  { value: "qris", label: "QRIS", icon: <Smartphone className="size-5" /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const tokenMeja = params.tokenMeja as string;
  const [nama, setNama] = useState("");
  const [metode, setMetode] = useState<string | null>(null);

  const handleLanjut = () => {
    if (!nama.trim() || !metode) return;
    router.push(`/${tokenMeja}/pembayaran/${metode}?nama=${encodeURIComponent(nama)}`);
  };

  return (
    <div className="bg-background">
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
              <div className="flex justify-between text-sm">
                <span>2x Nasi Gudeg</span>
                <span className="font-medium">Rp 50.000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>2x Es Teh Manis</span>
                <span className="font-medium">Rp 10.000</span>
              </div>
            </div>
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
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
          </CardContent>
        </Card>

        <div className="pt-4 pb-8">
          <Button
            className="w-full h-14 rounded-full text-lg font-bold"
            disabled={!nama.trim() || !metode}
            onClick={handleLanjut}
          >
            Lanjut ke Pembayaran
          </Button>
        </div>
      </main>
    </div>
  );
}
