"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ChefHat, PackageCheck } from "lucide-react";
import Link from "next/link";

interface PesananItem {
  id: number;
  namaMenu: string;
  harga: number;
  jumlah: number;
  catatan?: string;
}

interface Pesanan {
  id: string;
  items: PesananItem[];
  totalHarga: number;
  status: "menunggu" | "diproses" | "selesai";
  waktu: Date;
}

export default function DetailPesananPage() {
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);

  // Sample data - akan direplace dengan data dari backend
  useEffect(() => {
    // Cek localStorage untuk pesanan terbaru
    const saved = localStorage.getItem("lastPesanan");
    if (saved) {
      setPesanan(JSON.parse(saved));
    }
  }, []);

  const statusConfig = {
    menunggu: {
      label: "Menunggu",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-700",
    },
    diproses: {
      label: "Diproses",
      icon: ChefHat,
      color: "bg-blue-100 text-blue-700",
    },
    selesai: {
      label: "Selesai",
      icon: PackageCheck,
      color: "bg-green-100 text-green-700",
    },
  };

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
            <Link href="../">
              <Button>Pesan Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[pesanan.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <Link href="../" className="text-muted-foreground hover:text-foreground">
            ← Kembali
          </Link>
          <h1 className="flex-1 text-center font-bold">Detail Pesanan</h1>
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
                <Badge className={`mt-1 ${status.color}`}>
                  <StatusIcon className="size-3 mr-1" />
                  {status.label}
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
                const stepStatus = statusConfig[step as keyof typeof statusConfig];
                const StepIcon = stepStatus.icon;
                const isActive = pesanan.status === step;
                const isPast =
                  ["menunggu", "diproses", "selesai"].indexOf(pesanan.status) > index;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPast
                          ? "bg-green-500 text-white"
                          : isActive
                          ? stepStatus.color
                          : "bg-muted"
                      }`}
                    >
                      <StepIcon className="size-5" />
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">
                      {stepStatus.label}
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
                        📝 {item.catatan}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">
                    Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between">
              <p className="font-bold">Total</p>
              <p className="font-bold text-lg text-primary">
                Rp {pesanan.totalHarga.toLocaleString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}