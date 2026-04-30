"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ChefHat, PackageCheck, RefreshCw } from "lucide-react";
import { getActivePesananByToken } from "@/app/actions/pesanan";
import type { StatusPesanan } from "@/types";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PesananItem {
  id: number;
  namaMenu: string;
  harga: number;
  jumlah: number;
  catatan: string | null;
}

interface Pesanan {
  id: number;
  items: PesananItem[];
  total: number;
  status: StatusPesanan;
  waktu: string;
}

export default function DetailPesananPage() {
  const router = useRouter();
  const params = useParams();
  const tokenMeja = params.tokenMeja as string;
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const fetchPesanan = async () => {
    try {
      const data = await getActivePesananByToken(tokenMeja);
      setPesanan(data);
    } catch {
      setPesanan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPesanan();
  }, [tokenMeja]);

  const getBadgeVariant = (status: StatusPesanan) => {
    switch (status) {
      case 'menunggu': return 'outline';
      case 'diproses': return 'secondary';
      case 'selesai': return 'default';
      case 'dibatalkan': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!pesanan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="size-8 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg mb-2">Belum Ada Pesanan</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Silakan pesan menu terlebih dahulu
            </p>
            <Link href={`/${tokenMeja}`}>
              <Button>Pesan Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-background">
       {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  Kembali
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yakin ingin kembali?</DialogTitle>
                  <DialogDescription>
                    Anda tidak bisa memantau pesanan lagi jika kembali ke menu.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDialog(false);
                      router.push(`/${tokenMeja}`);
                    }}
                  >
                    Ya, Kembali
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <h1 className="flex-1 text-center font-bold">Status Pesanan</h1>
            <div className="w-12" />
          </div>
        </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Success Message */}
        {pesanan.status === "menunggu" && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="size-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Pesanan Berhasil!</p>
                <p className="text-sm text-green-600">
                  Pesananmu sedang menunggu diproses
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                 <Badge variant={getBadgeVariant(pesanan.status)} className="mt-1">
                  {pesanan.status === 'menunggu' && <Clock className="size-3 mr-1" />}
                  {pesanan.status === 'diproses' && <ChefHat className="size-3 mr-1" />}
                  {pesanan.status === 'selesai' && <PackageCheck className="size-3 mr-1" />}
                  {pesanan.status === 'dibatalkan' && <PackageCheck className="size-3 mr-1" />}
                  {pesanan.status === 'menunggu' ? 'Menunggu' : 
                   pesanan.status === 'diproses' ? 'Diproses' :
                   pesanan.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">No. Pesanan</p>
                <p className="font-mono font-bold">#{pesanan.id}</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {["menunggu", "diproses", "selesai"].map((step, index) => {
                const isActive = pesanan.status === step;
                const isPast = ["menunggu", "diproses", "selesai"].indexOf(pesanan.status) > index;
                
                const getStepIcon = (step: string) => {
                  if (step === "menunggu") return Clock;
                  if (step === "diproses") return ChefHat;
                  return PackageCheck;
                };
                
                const StepIcon = getStepIcon(step);
                
                return (
                  <div key={step} className="flex flex-col items-center">
                     <div
                       className={`w-10 h-10 rounded-full flex items-center justify-center ${
                         isPast
                           ? "bg-green-500 text-white"
                           : isActive
                           ? "bg-blue-100 text-blue-700"
                           : "bg-muted"
                       }`}
                     >
                       <StepIcon className="size-5" />
                     </div>
                     <p className="text-xs mt-2 text-muted-foreground">
                       {step === "menunggu" ? "Menunggu" : step === "diproses" ? "Diproses" : "Selesai"}
                     </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Item Pesanan</h3>
            <div className="space-y-3">
              {pesanan.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.jumlah}x {item.namaMenu}</p>
                    {item.catatan && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.catatan}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">
                    Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="border-t pt-2 flex justify-between">
                <p className="font-bold">Total</p>
                <p className="font-bold text-lg text-primary">
                  Rp {pesanan.total.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}