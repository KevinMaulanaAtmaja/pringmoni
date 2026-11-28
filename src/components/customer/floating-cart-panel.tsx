"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VarianBadge } from "@/components/ui/varian-badge";
import { getItemKey, VoucherPicker, type KeranjangItem } from "@/components/customer/cart-sheet";
import { hitungPotonganDiskon } from "@/lib/voucher";
import type { VoucherOpsi, VoucherTerpakai } from "@/types";

interface FloatingCartPanelProps {
  keranjang: KeranjangItem[];
  onUpdateJumlah: (key: string, jumlah: number) => void;
  onHapus: (key: string) => void;
  onCheckout: () => void;
  subtotal: number;
  totalHarga: number;
  voucher: VoucherTerpakai | null;
  onApplyVoucher: (voucher: VoucherTerpakai | null) => void;
  vouchers: VoucherOpsi[];
}

export function FloatingCartPanel({
  keranjang,
  onUpdateJumlah,
  onHapus,
  onCheckout,
  subtotal,
  totalHarga,
  voucher,
  onApplyVoucher,
  vouchers,
}: FloatingCartPanelProps) {
  const [lihatSemua, setLihatSemua] = useState(false);
  const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
  const potongan = voucher ? hitungPotonganDiskon(subtotal, voucher.diskonPersen) : 0;
  const itemsTampil = lihatSemua ? keranjang : keranjang.slice(0, 3);

  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-20 overflow-hidden rounded-2xl border bg-background/95 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-primary" />
            <p className="font-heading text-sm font-semibold">Keranjang</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {totalItem} item
          </Badge>
        </div>

        <div className="max-h-[calc(100vh-22rem)] space-y-2 overflow-y-auto p-3">
          {keranjang.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-center">
              <ShoppingBag className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Belum ada menu dipilih.</p>
            </div>
          ) : (
            itemsTampil.map((item) => {
              const key = getItemKey(item);
              const maksPorsi = item.adaResep ? item.porsiTersedia ?? 0 : null;
              const sudahMaks = maksPorsi !== null && item.jumlah >= maksPorsi;
              return (
                <div key={key} className="flex items-start gap-2 rounded-lg border p-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-xs font-medium">
                      {item.namaMenu}
                      {item.varian && <VarianBadge varian={item.varian} />}
                    </p>
                    {item.catatan && (
                      <p className="truncate text-[10px] text-muted-foreground">{item.catatan}</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-5"
                        aria-label={`Kurangi ${item.namaMenu}`}
                        onClick={() => onUpdateJumlah(key, item.jumlah - 1)}
                      >
                        <Minus className="size-2.5" />
                      </Button>
                      <span className="min-w-4 text-center text-[10px] font-semibold">{item.jumlah}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-5"
                        aria-label={`Tambah ${item.namaMenu}`}
                        disabled={sudahMaks}
                        onClick={() => onUpdateJumlah(key, item.jumlah + 1)}
                      >
                        <Plus className="size-2.5" />
                      </Button>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus ${item.namaMenu}`}
                    onClick={() => onHapus(key)}
                    className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
          {keranjang.length > 3 && (
            <button
              type="button"
              onClick={() => setLihatSemua((value) => !value)}
              className="w-full rounded-lg border border-dashed px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted"
            >
              {lihatSemua ? "Sembunyikan menu lain" : `+${keranjang.length - 3} menu lain`}
            </button>
          )}
        </div>

        <div className="space-y-1 border-t px-3 py-2.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          {voucher && potongan > 0 && (
            <div className="flex justify-between text-[11px] text-emerald-700">
              <span>Voucher {voucher.kode}</span>
              <span>-Rp {potongan.toLocaleString("id-ID")}</span>
            </div>
          )}
          <VoucherPicker
            subtotal={subtotal}
            voucher={voucher}
            onApplyVoucher={onApplyVoucher}
            vouchers={vouchers}
            compact
          />
          <p className="text-base font-bold text-primary">
            Rp {totalHarga.toLocaleString("id-ID")}
          </p>
          <Button
            type="button"
            className="mt-1 w-full rounded-full"
            disabled={keranjang.length === 0}
            onClick={onCheckout}
          >
            Checkout
          </Button>
        </div>
      </div>
    </aside>
  );
}
