"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, Banknote, CreditCard, Smartphone, Download,
  Copy, QrCode, Loader2, AlertCircle, Clock, ExternalLink
} from "lucide-react";
import {
  getPesananForCheckout, konfirmasiPembayaranCustomer,
  createMidtransPayment, checkMidtransPaymentStatus
} from "@/app/actions/pesanan";
import { hitungAdminFee } from "@/lib/fee";

export default function PembayaranMetodePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;
  const metode = params.metode as string;
  const orderId = searchParams.get("orderId") as string;
  const nama = searchParams.get("nama") as string;
  const confirmed = searchParams.get("confirmed") === "1";

  const BATAS_KONFIRMASI_MENIT = 60;
  const isNonTunai = metode === "transfer" || metode === "qris";

  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [waktuDibuat, setWaktuDibuat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sisaMenit, setSisaMenit] = useState(BATAS_KONFIRMASI_MENIT);

  const [adminFee, setAdminFee] = useState(0);
  const [totalBayar, setTotalBayar] = useState<number | null>(null);
  const [vaNumber, setVaNumber] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paid, setPaid] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (!metode || !nama || !orderId) {
      router.push(`/${tokenMeja}/checkout`);
      return;
    }
  }, [metode, nama, orderId, router, tokenMeja]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPesananForCheckout(orderId);
        if (!result) {
          setError("Pesanan tidak ditemukan");
          setLoading(false);
          return;
        }

        setOrderNumber(result.id);
        setTotal(result.total);
        setWaktuDibuat(result.waktu);

        if (!isNonTunai) {
          setTotalBayar(result.total);
          if (confirmed) setPaid(true);
          setLoading(false);
          return;
        }

        const fee = hitungAdminFee(metode as "transfer" | "qris", result.total);
        setAdminFee(fee);
        setTotalBayar(result.total + fee);

        const va = searchParams.get("va");
        const qr = searchParams.get("qrUrl");

        if (va || qr) {
          if (va) setVaNumber(va);
          if (qr) setQrUrl(qr);
          setLoading(false);
          return;
        }

        setGenerating(true);
        const payResult = await createMidtransPayment(orderId, tokenMeja, metode as "qris" | "transfer");

        if (payResult.error) {
          setGenerateError(payResult.error);
          setGenerating(false);
          setLoading(false);
          return;
        }

        if (payResult.payment_type === "bank_transfer" && payResult.va_number) {
          setVaNumber(payResult.va_number);
        } else if (payResult.payment_type === "qris") {
          setQrUrl(payResult.qr_url || null);
        }
        setGenerating(false);
        setLoading(false);
      } catch {
        setError("Gagal memuat data pesanan");
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!waktuDibuat) return;
    const t0 = new Date(waktuDibuat).getTime();
    const tick = () => {
      setSisaMenit(Math.max(0, Math.round(BATAS_KONFIRMASI_MENIT - (Date.now() - t0) / 1000 / 60)));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [waktuDibuat]);

  const handleKonfirmasiTunai = async () => {
    if (!orderId) return;
    setGenerating(true);
    setGenerateError(null);

    const timer = setTimeout(() => {
      setGenerateError("Waktu habis. Silakan coba lagi.");
      setGenerating(false);
    }, 15000);

    try {
      const result = await konfirmasiPembayaranCustomer(orderId, tokenMeja, metode);
      clearTimeout(timer);
      if (result.error) {
        setGenerateError(result.error);
        setGenerating(false);
        return;
      }
      setPaid(true);
      setGenerating(false);
    } catch {
      clearTimeout(timer);
      setGenerateError("Terjadi kesalahan. Silakan coba lagi.");
      setGenerating(false);
    }
  };

  const handleCopyVa = () => {
    if (!vaNumber) return;
    navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCekStatus = async () => {
    if (!orderId) return;
    setGenerateError(null);
    const result = await checkMidtransPaymentStatus(orderId);
    if (result.isSuccess) {
      setPaid(true);
    } else {
      setGenerateError("Pembayaran belum terdeteksi. Silakan coba lagi.");
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-10 animate-spin text-primary mx-auto mb-4" />
          <p className="font-medium">
            {generating ? "Membuat pembayaran..." : "Memuat..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <p className="text-muted-foreground text-sm text-center mb-6">{error}</p>
            <Button onClick={() => router.push(`/${tokenMeja}`)} variant="outline" className="rounded-full">
              Kembali ke Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h2 className="font-bold text-lg mb-2 text-center">
              {metode === "tunai" ? "Menunggu Pembayaran di Kasir" : "Pembayaran Berhasil!"}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-4">
              {metode === "tunai"
                ? `Terima kasih, ${nama}! Silakan menuju ke kasir untuk membayar.`
                : "Pembayaran telah diterima. Pesanan sedang diproses."}
            </p>
            <p className="text-2xl font-bold text-primary">
              Rp {(totalBayar || total || 0).toLocaleString("id-ID")}
            </p>
            <Button
              className="mt-6 rounded-full"
              onClick={() => router.push(`/${tokenMeja}/pesanan?orderId=${orderId}`)}
            >
              Lihat Status Pesanan
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
          <h1 className="flex-1 text-center font-bold">Pembayaran</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-1">Detail Pembayaran</h3>
            <p className="text-sm text-muted-foreground">
              Pelanggan: <span className="font-medium text-foreground">{nama}</span>
            </p>
            <p className="text-sm text-muted-foreground">
               No. Pesanan: <span className="font-medium text-foreground">#{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
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

        {sisaMenit <= 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className="size-5 shrink-0 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                Waktu konfirmasi habis! Silakan hubungi kasir.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tunai */}
        {metode === "tunai" && (
          <>
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
                <div className="bg-white rounded-lg flex justify-between font-bold">
                  <span>Total Bayar</span>
                  <span className="text-primary">Rp {(total || 0).toLocaleString("id-ID")}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Silakan menuju ke kasir untuk melakukan pembayaran tunai
                </p>
              </CardContent>
            </Card>

            {generateError && (
              <Card className="border-destructive">
                <CardContent className="p-3">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {generateError}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="pt-4 pb-8">
              <Button
                className="w-full h-14 rounded-full text-lg font-bold"
                disabled={sisaMenit <= 0}
                onClick={handleKonfirmasiTunai}
              >
                Konfirmasi Pembayaran
              </Button>
            </div>
          </>
        )}

        {/* Transfer VA */}
        {metode === "transfer" && (
          <Card className="border-blue-300">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="size-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg">Virtual Account</h3>
                <p className="text-sm text-muted-foreground">Lakukan pembayaran melalui ATM, mobile banking, atau internet banking</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 mb-1">Nomor Virtual Account</p>
                <p className="text-2xl font-mono font-bold tracking-wider text-blue-900">
                  {vaNumber || "-"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-full"
                  onClick={handleCopyVa}
                >
                  {copied ? "✓ Tersalin" : <><Copy className="size-3 mr-1" /> Salin</>}
                </Button>
              </div>

              <div className="bg-white rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Makanan</span>
                  <span>Rp {(total || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Biaya Admin (flat)</span>
                  <span>Rp {adminFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">Rp {(totalBayar || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium">Cara Pembayaran:</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Catat atau salin nomor Virtual Account di atas</li>
                  <li>Buka aplikasi mobile banking / ATM / internet banking</li>
                  <li>Pilih menu <strong>Transfer ke Virtual Account</strong></li>
                  <li>Masukkan nomor Virtual Account dan jumlah nominal yang sesuai</li>
                  <li>Konfirmasi dan selesaikan pembayaran</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="text-yellow-700">
                  Setelah melakukan pembayaran, klik tombol "Cek Status Pembayaran" di bawah.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QRIS */}
        {metode === "qris" && (
          <Card className="border-green-300">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="size-7 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">QRIS</h3>
                <p className="text-sm text-muted-foreground">Scan kode QR di bawah menggunakan aplikasi pembayaran</p>
              </div>

              <div className="bg-white rounded-xl p-4 flex flex-col items-center border">
                {qrUrl ? (
                  <>
                    <img
                      src={qrUrl}
                      alt="QR Code Pembayaran"
                      className="w-56 h-56 object-contain"
                    />
                    <a
                      href={`/api/download-qr?url=${encodeURIComponent(qrUrl)}`}
                      download="qris-pembayaran.png"
                      className="mt-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Download QR"
                    >
                      <Download className="size-6" />
                    </a>
                  </>
                ) : (
                  <div className="w-56 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="size-24 text-gray-400" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Scan menggunakan e-wallet atau aplikasi pembayaran QRIS lainnya
                </p>
              </div>

              <div className="bg-white rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Makanan</span>
                  <span>Rp {(total || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Biaya Admin (0.7%)</span>
                  <span>Rp {adminFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">Rp {(totalBayar || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="text-yellow-700">
                  Setelah melakukan pembayaran, klik tombol "Cek Status Pembayaran" di bawah.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Non-tunai: Cek Status button */}
        {isNonTunai && (
          <div className="pt-2 pb-8 space-y-2">
            {generateError && (
              <Card className="border-destructive">
                <CardContent className="p-3">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {generateError}
                  </p>
                </CardContent>
              </Card>
            )}
            <Button
              variant="outline"
              className="w-full h-12 rounded-full"
              onClick={handleCekStatus}
            >
              <ExternalLink className="size-4 mr-2" />
              Cek Status Pembayaran
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Sudah bayar? Klik tombol di atas untuk verifikasi
            </p>
            <p className="text-xs text-center text-muted-foreground pt-2 border-t">
              Ingin ganti metode pembayaran? Silakan hubungi kasir.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
