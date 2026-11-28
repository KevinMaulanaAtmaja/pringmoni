"use client";

import { useState } from "react";
import { Trash2, ShoppingBag, Ticket, Check, ChevronDown, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { VarianBadge } from "@/components/ui/varian-badge";
import { validateVoucher } from "@/app/actions/voucher";
import { hitungPotonganDiskon } from "@/lib/voucher";
import { cn } from "@/lib/utils";
import type { VoucherOpsi, VoucherTerpakai } from "@/types";

export interface KeranjangItem {
  id: number;
  namaMenu: string;
  harga: number;
  jumlah: number;
  catatan: string | null;
  /** Varian suhu yang dipilih pelanggan: "Panas" / "Dingin" (opsional) */
  varian?: string | null;
  /** Punya >= 1 bahan di resep → jumlah dibatasi sisa porsi */
  adaResep?: boolean;
  porsiTersedia?: number;
}

interface CartSheetProps {
  children: React.ReactNode;
  keranjang: KeranjangItem[];
  onUpdateJumlah: (key: string, jumlah: number) => void;
  onHapus: (key: string) => void;
  onCheckout?: () => void;
  submitting?: boolean;
  subtotal: number;
  totalHarga: number;
  voucher: VoucherTerpakai | null;
  onApplyVoucher: (voucher: VoucherTerpakai | null) => void;
  /** Voucher aktif dari server (dipakai untuk daftar pilihan) */
  vouchers: VoucherOpsi[];
  side?: "right" | "bottom";
}

export function getItemKey(item: KeranjangItem): string {
  return `${item.id}-${item.catatan || "no-note"}-${item.varian || "no-varian"}`;
}

export function CartSheet({
  children,
  keranjang,
  onUpdateJumlah,
  onHapus,
  onCheckout,
  submitting,
  subtotal,
  totalHarga,
  voucher,
  onApplyVoucher,
  vouchers,
  side = "right",
}: CartSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
  const potonganVoucher = voucher
    ? hitungPotonganDiskon(subtotal, voucher.diskonPersen)
    : 0;

return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        side={side}
        className={cn(
          "flex w-full flex-col p-0",
          side === "bottom" ? "max-h-[85vh] pb-8" : "sm:max-w-lg",
        )}
      >
        <SheetHeader className="border-b px-4 py-4">
          <div className="flex items-center justify-center">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              Keranjang
              <span className="text-sm text-muted-foreground">({totalItem} item)</span>
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Cart Items */}
          <div className="p-4">
            {keranjang.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                <ShoppingBag className="size-12 mb-4 opacity-50" />
                <p>Keranjang kosong</p>
                <p className="text-sm">Pilih menu untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-3">
{keranjang.map((item) => {
                    const key = getItemKey(item);
                    // Menu berresep tidak boleh melebihi sisa porsi dari bahan.
                    const maksPorsi = item.adaResep ? item.porsiTersedia ?? 0 : null;
                    const sudahMaks = maksPorsi !== null && item.jumlah >= maksPorsi;
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-xl border bg-card"
                      >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="flex items-center gap-1.5 font-medium">
                            {item.namaMenu}
                            {item.varian && <VarianBadge varian={item.varian} />}
                          </h4>
                          <p className="text-primary font-semibold text-sm">
                            Rp {item.harga.toLocaleString("id-ID")}
                          </p>
                          {item.catatan && (
                            <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-1 rounded-full inline-block">
                              {item.catatan}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onHapus(key)}
                          className="text-muted-foreground hover:text-destructive shrink-0 p-1"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                          <button
                            onClick={() => onUpdateJumlah(key, item.jumlah - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="font-bold w-5 text-center text-sm">{item.jumlah}</span>
<button
                            onClick={() => onUpdateJumlah(key, item.jumlah + 1)}
                            disabled={sudahMaks}
                            title={sudahMaks ? `Maksimal ${maksPorsi} porsi sesuai stok bahan` : undefined}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3" />
                          </button>
                        </div>
                        <p className="font-bold text-sm">
                          Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary Section - Di dalam area putih */}
          {keranjang.length > 0 && (
            <div className="px-4 pb-4 space-y-3">
               {/* Subtotal */}
               <div className="flex justify-between text-sm py-2 border-t">
                 <span className="text-muted-foreground">Subtotal</span>
                 <span>Rp {subtotal.toLocaleString("id-ID")}</span>
               </div>

               {/* PPN 0% */}
               <div className="flex justify-between text-sm py-2">
                 <span className="text-muted-foreground">PPN (0%)</span>
                 <span>Rp 0</span>
               </div>

               {/* Diskon voucher */}
               {voucher && (
                 <div className="flex justify-between text-sm py-2">
                   <span className="text-muted-foreground">
                     Diskon ({voucher.kode})
                   </span>
                   <span className="text-green-600">
                     -Rp {potonganVoucher.toLocaleString("id-ID")}
                   </span>
                 </div>
               )}

                <VoucherPicker
                  subtotal={subtotal}
                  voucher={voucher}
                  onApplyVoucher={onApplyVoucher}
                  vouchers={vouchers}
                />


              {/* Divider */}
              <div className="border-t" />

               {/* Total - Highlighted */}
               <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border-2 border-primary/20">
                 <span className="font-bold text-lg">Total</span>
                 <span className="font-bold text-xl text-primary">
                   Rp {totalHarga.toLocaleString("id-ID")}
                 </span>
               </div>
            </div>
          )}
        </div>

        {/* Checkout Button */}
        {keranjang.length > 0 && (
          <div className="p-4 border-t bg-background">
            <Button className="w-full rounded-full h-12" size="lg" onClick={onCheckout} disabled={submitting}>
              {submitting ? "Memproses..." : "Checkout"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface VoucherPickerProps {
  subtotal: number;
  voucher: VoucherTerpakai | null;
  onApplyVoucher: (voucher: VoucherTerpakai | null) => void;
  vouchers: VoucherOpsi[];
  compact?: boolean;
}

export function VoucherPicker({
  subtotal,
  voucher,
  onApplyVoucher,
  vouchers,
  compact = false,
}: VoucherPickerProps) {
  const [daftarBuka, setDaftarBuka] = useState(false);
  const [inputBuka, setInputBuka] = useState(false);
  const [kode, setKode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const potongan = voucher ? hitungPotonganDiskon(subtotal, voucher.diskonPersen) : 0;
  const kurang = voucher ? Math.max(0, voucher.minimalBelanja - subtotal) : 0;

  const pakaiVoucher = async (kodeVoucher: string) => {
    if (!kodeVoucher.trim()) {
      setError("Masukkan kode voucher");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const hasil = await validateVoucher(kodeVoucher.trim(), subtotal);
      if (!hasil.valid || !hasil.kode) {
        setError(hasil.error ?? "Kode voucher tidak valid");
        return;
      }
      onApplyVoucher({
        kode: hasil.kode,
        namaVoucher: hasil.namaVoucher ?? hasil.kode,
        diskonPersen: hasil.diskonPersen ?? 0,
        minimalBelanja: hasil.minimalBelanja ?? 0,
      });
      setKode("");
      setDaftarBuka(false);
      setInputBuka(false);
    } catch {
      setError("Gagal memvalidasi voucher. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const lepasVoucher = () => {
    onApplyVoucher(null);
    setKode("");
    setError("");
  };

  return (
    <div className="space-y-2">
      {voucher && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-2.5 py-2",
            kurang > 0 ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50",
          )}
        >
          <Ticket className={cn("size-4 shrink-0", kurang > 0 ? "text-amber-600" : "text-emerald-600")} />
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-xs font-semibold", kurang > 0 ? "text-amber-800" : "text-emerald-800")}>
              {voucher.kode} · diskon {voucher.diskonPersen}%
            </p>
            <p className={cn("text-[10px]", kurang > 0 ? "text-amber-700" : "text-emerald-700")}>
              {kurang > 0
                ? `Kurang Rp ${kurang.toLocaleString("id-ID")} untuk pakai voucher ini`
                : `Hemat Rp ${potongan.toLocaleString("id-ID")}`}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-emerald-700 hover:text-destructive"
            aria-label="Lepas voucher"
            onClick={lepasVoucher}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {vouchers.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={daftarBuka}
            onClick={() => setDaftarBuka((buka) => !buka)}
            className="flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-1.5">
              <Ticket className="size-3.5 text-primary" />
              {voucher ? "Ganti voucher" : "Pilih voucher"}
              <span className="font-normal">({vouchers.length} tersedia)</span>
            </span>
            <ChevronDown className={cn("size-3.5 transition-transform", daftarBuka && "rotate-180")} />
          </button>
          {daftarBuka && (
            <div className={cn("space-y-1.5 overflow-y-auto rounded-xl border bg-muted/40 p-1.5", compact ? "max-h-40" : "max-h-52")}>
              {vouchers.map((v) => {
                const aktif = voucher?.kode === v.kode;
                const memenuhi = subtotal >= v.minimalBelanja;
                const kurangBelanja = v.minimalBelanja - subtotal;
                return (
                  <button
                    key={v.kode}
                    type="button"
                    disabled={!memenuhi || loading}
                    onClick={() => (aktif ? lepasVoucher() : void pakaiVoucher(v.kode))}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                      aktif
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-transparent bg-background hover:border-primary/30",
                      !memenuhi && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {v.namaVoucher}
                        <span className="ml-1 font-normal text-muted-foreground">· {v.kode}</span>
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        Diskon {v.diskonPersen}% · min. Rp {v.minimalBelanja.toLocaleString("id-ID")}
                        {!memenuhi && ` · kurang Rp ${kurangBelanja.toLocaleString("id-ID")}`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        aktif ? "bg-emerald-600 text-white" : "bg-primary/10 text-primary",
                      )}
                    >
                      {aktif && <Check className="size-2.5" />}
                      {aktif ? "Dipakai" : memenuhi ? "Pakai" : "Belum cukup"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {!voucher && (
        <div>
          <button
            type="button"
            aria-expanded={inputBuka}
            onClick={() => setInputBuka((buka) => !buka)}
            className="text-[11px] text-primary underline-offset-2 hover:underline"
          >
            Punya kode voucher? Ketik di sini
          </button>
          {inputBuka && (
            <div className="mt-1.5 flex gap-1.5">
              <Input
                value={kode}
                onChange={(e) => {
                  setKode(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void pakaiVoucher(kode);
                }}
                placeholder="Kode voucher"
                className="h-8 flex-1 text-xs"
              />
              <Button
                type="button"
                size="sm"
                className="h-8 shrink-0 px-3 text-xs"
                disabled={loading}
                onClick={() => void pakaiVoucher(kode)}
              >
                {loading ? "..." : "Pakai"}
              </Button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
