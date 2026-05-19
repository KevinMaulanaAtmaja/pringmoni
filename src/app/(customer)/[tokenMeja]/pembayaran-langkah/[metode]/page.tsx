"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Banknote, ArrowLeft, CreditCard, Smartphone, Copy, QrCode, Loader2 } from "lucide-react";

const total = 60000;

export default function PembayaranLangkahPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;
  const metode = params.metode as string;
  const nama = searchParams.get("nama") as string;
  const [step, setStep] = useState(1);
  const [noRekening, setNoRekening] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!metode || !nama) {
      router.push(`/${tokenMeja}/checkout`);
    }
  }, [metode, nama, router, tokenMeja]);

  const getTotalSteps = () => {
    switch (metode) {
      case "tunai": return 2;
      case "transfer": return 3;
      case "qris": return 3;
      default: return 2;
    }
  };

  const handleNext = async () => {
    if (metode === "transfer" && step === 2 && !noRekening.trim()) return;

    if (step < getTotalSteps()) {
      setStep(step + 1);
    } else {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push(`/${tokenMeja}/pesanan?nama=${encodeURIComponent(nama)}&metode=${metode}`);
    }
  };

  const renderStepContent = () => {
    switch (metode) {
      case "tunai":
        if (step === 1) {
          return (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
                  <Banknote className="size-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Siapkan Uang Tunai</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Silakan siapkan uang sebesar
                  </p>
                  <p className="text-3xl font-bold text-yellow-700 mt-2">
                    Rp {total.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-left">
                  <p className="text-sm font-medium mb-2">Langkah-langkah:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Siapkan uang tunai</li>
                    <li>Datang ke kasir</li>
                    <li>Sebutkan kode pesanan</li>
                    <li>Serahkan uang tunai</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (step === 2) {
          return (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="size-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">Konfirmasi Pembayaran</h3>
                <p className="text-sm text-muted-foreground">
                  Pastikan Anda sudah menyerahkan uang tunai sebesar
                </p>
                <p className="text-3xl font-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Kode Pesanan</p>
                  <p className="font-mono font-bold text-lg">PRG-001</p>
                </div>
              </CardContent>
            </Card>
          );
        }
        break;

      case "transfer":
        if (step === 1) {
          return (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="size-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">Transfer ke Rekening</h3>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium">BCA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">No. Rekening</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">1234567890</span>
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() => navigator.clipboard.writeText("1234567890")}
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Atas Nama</span>
                    <span className="font-medium">Restoran Pringsewu</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Transfer</span>
                      <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Gunakan aplikasi m-banking untuk transfer sesuai nominal
                </p>
              </CardContent>
            </Card>
          );
        }
        if (step === 2) {
          return (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Verifikasi Transfer</h3>
                <div>
                  <label className="text-sm font-medium">No. Rekening Pengirim</label>
                  <input
                    type="text"
                    placeholder="Contoh: 9876543210"
                    value={noRekening}
                    onChange={(e) => setNoRekening(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Masukkan 10-15 digit no. rekening yang digunakan transfer
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600">
                    Pastikan no. rekening benar untuk verifikasi otomatis
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (step === 3) {
          return (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="size-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">Konfirmasi Pembayaran</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer dari rekening {noRekening} sebesar
                </p>
                <p className="text-3xl font-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Status Verifikasi</p>
                  <p className="text-sm font-medium text-green-600">✓ Terverifikasi</p>
                </div>
              </CardContent>
            </Card>
          );
        }
        break;

      case "qris":
        if (step === 1) {
          return (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="size-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg">Scan QRIS</h3>
                </div>
                <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="size-24 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan menggunakan OVO, GoPay, DANA, atau aplikasi dengan fitur QRIS
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (step === 2) {
          return (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <Loader2 className="size-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="font-bold text-lg">Memproses Pembayaran</h3>
                <p className="text-sm text-muted-foreground">
                  Silakan selesaikan pembayaran di aplikasi Anda
                </p>
                <p className="text-3xl font-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Jangan tutup halaman ini sampai pembayaran selesai
                </p>
              </CardContent>
            </Card>
          );
        }
        if (step === 3) {
          return (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="size-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">Pembayaran Berhasil</h3>
                <p className="text-sm text-muted-foreground">
                  Pembayaran QRIS sebesar
                </p>
                <p className="text-3xl font-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Pembayaran terdeteksi otomatis
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        }
        break;
    }
  };

  const getButtonText = () => {
    if (loading) return "Memproses...";
    if (metode === "tunai") {
      return step === 1 ? "Sudah Siap Bayar" : "Konfirmasi Pembayaran";
    }
    if (metode === "transfer") {
      if (step === 1) return "Sudah Transfer";
      if (step === 2) return "Verifikasi";
      return "Konfirmasi Pembayaran";
    }
    if (metode === "qris") {
      if (step === 1) return "Sudah Scan QR";
      if (step === 2) return "Pembayaran Selesai";
      return "Konfirmasi Pembayaran";
    }
  };

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <button
            onClick={() => step === 1 ? router.push(`/${tokenMeja}/checkout`) : setStep(step - 1)}
            className="text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="flex-1 text-center font-bold">Pembayaran</h1>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : i < step ? "w-8 bg-primary/60" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pelanggan: <span className="font-medium text-foreground">{nama}</span></p>
            <Badge variant="outline" className="mt-2 capitalize">
              {metode === "tunai" && <Banknote className="size-3 mr-1" />}
              {metode === "transfer" && <CreditCard className="size-3 mr-1" />}
              {metode === "qris" && <Smartphone className="size-3 mr-1" />}
              {metode}
            </Badge>
          </CardContent>
        </Card>

        {renderStepContent()}

        <div className="pt-4 pb-8">
          <Button
            className="w-full h-14 rounded-full text-lg font-bold"
            disabled={loading || (metode === "transfer" && step === 2 && !noRekening.trim())}
            onClick={handleNext}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
