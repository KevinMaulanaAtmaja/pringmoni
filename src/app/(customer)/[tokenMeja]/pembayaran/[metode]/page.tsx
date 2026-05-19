"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Banknote, ArrowLeft, CreditCard, Smartphone, Copy, QrCode } from "lucide-react";

const total = 60000;

export default function PembayaranMetodePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;
  const metode = params.metode as string;
  const nama = searchParams.get("nama") as string;
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!metode || !nama) {
      router.push(`/${tokenMeja}/checkout`);
    }
  }, [metode, nama, router, tokenMeja]);

  if (success) {
    return (
      <div className="bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h2 className="font-bold text-lg mb-2">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground text-sm text-center mb-4">
              Terima kasih, {nama}! Pesanan sedang diproses
            </p>
            <p className="text-2xl font-bold text-primary">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCaraBayar = () => {
    switch (metode) {
      case "tunai":
        return (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Banknote className="size-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pembayaran Tunai</p>
                  <p className="text-xs text-muted-foreground">Bayar di kasir</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Bayar</span>
                  <span className="font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Silakan menuju ke kasir untuk melakukan pembayaran tunai
              </p>
            </CardContent>
          </Card>
        );

      case "transfer":
        return (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Transfer Bank</p>
                  <p className="text-xs text-muted-foreground">BCA / Mandiri / BNI</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">No. Rekening</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">1234567890</span>
                    <button className="text-primary hover:text-primary/80" onClick={() => navigator.clipboard.writeText("1234567890")}>
                      <Copy className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Atas Nama</span>
                  <span className="font-medium">Restoran Pringsewu</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Transfer</span>
                  <span className="font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Silakan transfer sesuai nominal dan tunjukkan bukti ke kasir
              </p>
            </CardContent>
          </Card>
        );

      case "qris":
        return (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Smartphone className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">QRIS Payment</p>
                  <p className="text-xs text-muted-foreground">Scan QR Code di bawah</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <QrCode className="size-20 text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan QR Code ini menggunakan<br />OVO, GoPay, DANA, atau QRIS lainnya
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Pembayaran</span>
                  <span className="font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Tunjukkan halaman ini ke kasir setelah pembayaran
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="flex-1 text-center font-bold">Cara Pembayaran</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-1">Detail Pembayaran</h3>
            <p className="text-sm text-muted-foreground">Pelanggan: <span className="font-medium text-foreground">{nama}</span></p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="capitalize">
                {metode === "tunai" && <Banknote className="size-3 mr-1" />}
                {metode === "transfer" && <CreditCard className="size-3 mr-1" />}
                {metode === "qris" && <Smartphone className="size-3 mr-1" />}
                {metode}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {renderCaraBayar()}

        <div className="pt-4 pb-8">
          <Button
            className="w-full h-14 rounded-full text-lg font-bold"
            onClick={() => {
              setSuccess(true);
              setTimeout(() => router.push(`/${tokenMeja}/pesanan?nama=${encodeURIComponent(nama)}&metode=${metode}`), 2000);
            }}
          >
            Konfirmasi Pembayaran Rp {total.toLocaleString("id-ID")}
          </Button>
        </div>
      </main>
    </div>
  );
}
