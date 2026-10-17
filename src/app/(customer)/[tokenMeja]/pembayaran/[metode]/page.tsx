"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, Banknote, CreditCard, Loader2, AlertCircle, Clock
} from "lucide-react";
import { getQrisStaticUrl } from "@/lib/qris-static";
import {
  getPesananForCheckout, konfirmasiPembayaranCustomer, getCustomerPaymentStatus
} from "@/app/actions/pesanan";

export default function PembayaranMetodePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") as string;
  const metode = params.metode as string;
  const tokenMeja = params.tokenMeja as string;
  const confirmed = searchParams.get("confirmed") === "1";

  const BATAS_KONFIRMASI_MENIT = 60;

  const [nama, setNama] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paid, setPaid] = useState(false);
  const [expired, setExpired] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [sisaMenit, setSisaMenit] = useState<number>(BATAS_KONFIRMASI_MENIT);
  const [waktuDibuat, setWaktuDibuat] = useState<string | null>(null);

  useEffect(() => {
    if (!metode || !orderId || !["tunai", "qris"].includes(metode)) {
      router.push(`/${tokenMeja}/checkout`);
      return;
    }
  }, [metode, orderId, router, tokenMeja]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getPesananForCheckout(orderId);
        if (!result) {
          setError("Pesanan tidak ditemukan");
          setLoading(false);
          return;
        }

        if (result.namaPelanggan) setNama(result.namaPelanggan);
        setTotal(result.total);
        setWaktuDibuat(result.waktu);

        if (metode === "tunai") {
          if (confirmed) setPaid(true);
        } else if (result.statusPembayaran === "berhasil") {
          setPaid(true);
        }

        if (result.statusPembayaran === "dibatalkan") {
          setExpired(true);
        }

        setLoading(false);
      } catch {
        setError("Gagal memuat data pesanan");
        setLoading(false);
      }
    };
    load();
  }, [orderId, metode, confirmed]);

  useEffect(() => {
    if (!waktuDibuat) return;
    const tanggalDibuat = new Date(waktuDibuat).getTime();
    const hitungSisa = () => {
      const sisa = BATAS_KONFIRMASI_MENIT - (Date.now() - tanggalDibuat) / 1000 / 60;
      const sisaBulat = Math.max(0, Math.round(sisa));
      setSisaMenit(sisaBulat);
      if (sisaBulat <= 0) setExpired(true);
    };
    hitungSisa();
    const interval = setInterval(hitungSisa, 30000);
    return () => clearInterval(interval);
  }, [waktuDibuat]);

  useEffect(() => {
    if (!orderId || paid || expired) return;
    const interval = setInterval(async () => {
      const status = await getCustomerPaymentStatus(orderId);
      if (!status) return;
      if (status.statusPembayaran === "berhasil") {
        setPaid(true);
      } else if (status.statusPembayaran === "dibatalkan") {
        setExpired(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [orderId, paid, expired]);

  const handleKonfirmasiTunai = async () => {
    if (!orderId) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      const result = await konfirmasiPembayaranCustomer(orderId, tokenMeja, metode);
      if (result.error) {
        setGenerateError(result.error);
        setGenerating(false);
        return;
      }
      setPaid(true);
      setGenerating(false);
    } catch {
      setGenerateError("Terjadi kesalahan. Silakan coba lagi.");
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-10 animate-spin text-primary mx-auto mb-4" />
          <p className="font-medium">{generating ? "Menyimpan..." : "Memuat..."}</p>
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
      <div className="bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <h2 className="font-bold text-lg mb-2 text-center">
              {metode === "tunai" ? "Menunggu Pembayaran di Kasir" : "Pembayaran Diterima!"}
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-4">
              {metode === "tunai"
                ? `Terima kasih, ${nama}! Silakan menuju ke kasir untuk membayar.`
                : "Pembayaran telah dikonfirmasi kasir. Pesanan sedang diproses."}
            </p>
            <p className="text-2xl font-bold text-primary">
              Rp {(total || 0).toLocaleString("id-ID")}
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

  if (expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h2 className="font-bold text-lg mb-2 text-center">Pembayaran telah dibatalkan</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Pesanan telah ditutup. Silakan lakukan pemesanan ulang.
            </p>
            <Button onClick={() => router.push(`/${tokenMeja}`)} className="rounded-full">
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
          <h1 className="flex-1 text-center font-bold">Pembayaran</h1>
        </div>
      </header>

      <main className="max-w-2xl md:max-w-3xl mx-auto px-4 py-6 space-y-4">
        {sisaMenit <= 15 && sisaMenit > 0 && (
          <Card className={`border-2 ${sisaMenit <= 1 ? "border-red-500 bg-red-50" : "border-orange-300 bg-orange-50"}`}>
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className={`size-5 shrink-0 ${sisaMenit <= 1 ? "text-destructive" : "text-orange-600"}`} />
              <div>
                <p className={`text-sm font-semibold ${sisaMenit <= 1 ? "text-destructive" : "text-orange-700"}`}>
                  {sisaMenit <= 1
                    ? `Peringatan: sisa waktu ${sisaMenit} menit!`
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
                {metode === "qris" && <CreditCard className="size-3 mr-1" />}
                {metode}
              </Badge>
            </div>
          </CardContent>
        </Card>

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
                onClick={handleKonfirmasiTunai}
              >
                Konfirmasi Pembayaran
              </Button>
            </div>
          </>
        )}

        {/* QRIS Statis */}
        {metode === "qris" && (
          <>
            <Card className="border-green-300">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="size-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg">QRIS</h3>
                  <p className="text-sm text-muted-foreground">Scan kode QR di bawah menggunakan aplikasi pembayaran</p>
                </div>

                <div className="bg-white rounded-xl p-4 flex flex-col items-center border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getQrisStaticUrl()}
                    alt="QRIS Statis"
                    className="w-56 h-56 object-contain"
                  />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Scan menggunakan e-wallet atau aplikasi pembayaran QRIS lainnya
                  </p>
                </div>

                <div className="bg-white rounded-lg flex justify-between font-bold text-base border-t pt-1">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">Rp {(total || 0).toLocaleString("id-ID")}</span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex items-center gap-2">
                  <Clock className="size-4 shrink-0 text-green-600" />
                  <p className="text-green-700">
                    Pesanan dibatalkan otomatis jika belum dikonfirmasi dalam {BATAS_KONFIRMASI_MENIT} menit
                  </p>
                </div>
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

            <div className="pt-4 pb-8 space-y-3">
              <Button
                className="w-full h-14 rounded-full text-lg font-bold"
                onClick={async () => {
                  setGenerateError(null);
                  await konfirmasiPembayaranCustomer(orderId, tokenMeja, "qris");
                  router.push(`/${tokenMeja}/pesanan?orderId=${orderId}`);
                }}
              >
                Saya Sudah Bayar
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Pembayaran akan diverifikasi oleh kasir secara manual. Setelah klik tombol di atas, silakan tunggu konfirmasi.
              </p>
              <p className="text-xs text-center text-muted-foreground pt-2 border-t">
                Ingin ganti metode pembayaran? Silakan hubungi kasir.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}