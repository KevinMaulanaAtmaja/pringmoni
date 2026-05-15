"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ChefHat, PackageCheck, Banknote, CreditCard, Smartphone } from "lucide-react";

type StatusPesanan = "menunggu" | "diproses" | "selesai" | "dibatalkan";
type MetodePembayaran = "tunai" | "transfer" | "qris";

const metodeConfig = {
  tunai: { label: "Tunai", icon: Banknote },
  transfer: { label: "Transfer", icon: CreditCard },
  qris: { label: "QRIS", icon: Smartphone },
};

export default function DetailPesananPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;

  const namaParam = searchParams.get("nama") || "";
  const metodeParam = searchParams.get("metode") || "";

  const pesanan = {
    id: 1,
    items: [
      { namaMenu: "Nasi Gudeg", jumlah: 2, harga: 25000, catatan: null as string | null },
      { namaMenu: "Es Teh Manis", jumlah: 2, harga: 5000, catatan: null as string | null },
    ],
    total: 60000,
    status: "diproses" as StatusPesanan,
    waktu: "12:30",
    meja: "A1",
    namaPelanggan: namaParam || "Pelanggan",
    metodePembayaran: (metodeParam || "tunai") as MetodePembayaran,
  };
  const metode = metodeConfig[pesanan.metodePembayaran];
  const MetodeIcon = metode.icon;

  const getBadgeVariant = (status: StatusPesanan) => {
    switch (status) {
      case "menunggu": return "outline";
      case "diproses": return "secondary";
      case "selesai": return "default";
      case "dibatalkan": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex h-14 items-center px-4">
          <button onClick={() => router.push(`/${tokenMeja}`)} className="text-muted-foreground hover:text-foreground">
            Kembali
          </button>
          <h1 className="flex-1 text-center font-bold">Status Pesanan</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {pesanan.status === "menunggu" && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="size-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Pesanan Berhasil!</p>
                <p className="text-sm text-green-600">Pesananmu sedang menunggu diproses</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getBadgeVariant(pesanan.status)} className="mt-1">
                  {pesanan.status === "menunggu" && <Clock className="size-3 mr-1" />}
                  {pesanan.status === "diproses" && <ChefHat className="size-3 mr-1" />}
                  {pesanan.status === "selesai" && <PackageCheck className="size-3 mr-1" />}
                  {pesanan.status === "menunggu" && "Menunggu"}
                  {pesanan.status === "diproses" && "Diproses"}
                  {pesanan.status === "selesai" && "Selesai"}
                  {pesanan.status === "dibatalkan" && "Dibatalkan"}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">No. Pesanan</p>
                <p className="font-mono font-bold">#{pesanan.id}</p>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Pelanggan: </span>
                <span className="font-medium">{pesanan.namaPelanggan}</span>
              </p>
              <div className="flex items-center gap-2">
                <MetodeIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{metode.label}</span>
              </div>
            </div>

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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isPast ? "bg-green-500 text-white" : isActive ? "bg-blue-100 text-blue-700" : "bg-muted"
                    }`}>
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

        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Item Pesanan</h3>
            <div className="space-y-3">
              {pesanan.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.jumlah}x {item.namaMenu}</p>
                    {item.catatan && (
                      <p className="text-xs text-muted-foreground mt-1">{item.catatan}</p>
                    )}
                  </div>
                  <p className="font-semibold">
                    Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p className="text-primary">Rp {pesanan.total.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
