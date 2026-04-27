"use client";

import { useState } from "react";
import { Trash2, ShoppingBag, Ticket, CheckCircle, X } from "lucide-react";
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

interface Voucher {
  kode: string;
  potongan: number;
  minPembelian: number;
}

interface KeranjangItem {
  id: number;
  namaMenu: string;
  harga: number;
  jumlah: number;
  catatan?: string;
}

interface CartSheetProps {
  children: React.ReactNode;
  keranjang: KeranjangItem[];
  onUpdateJumlah: (key: string, jumlah: number) => void;
  onHapus: (key: string) => void;
  onCheckout?: () => void;
  subtotal: number;
  voucher: Voucher | null;
  onApplyVoucher: (voucher: Voucher | null) => void;
}

function getItemKey(item: KeranjangItem): string {
  return `${item.id}-${item.catatan || "no-note"}`;
}

const MIN_PEMBELIAN = 1000000;

const sampleVouchers: Voucher[] = [
  { kode: "PRINGMONI10", potongan: 10000, minPembelian: MIN_PEMBELIAN },
  { kode: "PRINGMONI25", potongan: 25000, minPembelian: MIN_PEMBELIAN },
];

export function CartSheet({
  children,
  keranjang,
  onUpdateJumlah,
  onHapus,
  onCheckout,
  subtotal,
  voucher,
  onApplyVoucher,
}: CartSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [showVoucherList, setShowVoucherList] = useState(false);

  const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);

  const totalHarga = voucher
    ? subtotal - voucher.potongan
    : subtotal;

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) {
      setVoucherError("Masukkan kode voucher");
      return;
    }

    const found = sampleVouchers.find(
      (v) => v.kode.toLowerCase() === voucherInput.trim().toLowerCase()
    );

    if (!found) {
      setVoucherError("Kode voucher tidak valid");
      return;
    }

    if (subtotal < found.minPembelian) {
      setVoucherError(`Min. pembelian Rp ${found.minPembelian.toLocaleString("id-ID")}`);
      return;
    }

    onApplyVoucher(found);
    setVoucherInput("");
    setVoucherError("");
    setShowVoucherList(false);
  };

  const handleRemoveVoucher = () => {
    onApplyVoucher(null);
    setVoucherInput("");
    setVoucherError("");
  };

  const handleSelectVoucher = (v: Voucher) => {
    if (subtotal < v.minPembelian) {
      setVoucherError(`Min. pembelian Rp ${v.minPembelian.toLocaleString("id-ID")}`);
      return;
    }
    onApplyVoucher(v);
    setVoucherInput("");
    setVoucherError("");
    setShowVoucherList(false);
  };

return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
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
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl border bg-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{item.namaMenu}</h4>
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
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                          >
                            <Plus className="size-3" />
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

              {/* Voucher Input */}
              {voucher ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">{voucher.kode}</p>
                      <p className="text-xs text-green-600">
                        -Rp {voucher.potongan.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-green-600 hover:text-green-800 p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Kode voucher"
                        value={voucherInput}
                        onChange={(e) => {
                          setVoucherInput(e.target.value);
                          setVoucherError("");
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowVoucherList(!showVoucherList)}
                    >
                      List
                    </Button>
                    <Button onClick={handleApplyVoucher}>Apply</Button>
                  </div>
                  {voucherError && (
                    <p className="text-xs text-destructive">{voucherError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Min. pembelian Rp {MIN_PEMBELIAN.toLocaleString("id-ID")}
                  </p>

                  {showVoucherList && (
                    <div className="border rounded-lg p-2 space-y-2 bg-muted/50">
                      {sampleVouchers.map((v) => (
                        <button
                          key={v.kode}
                          onClick={() => handleSelectVoucher(v)}
                          className="w-full text-left p-2 rounded-lg hover:bg-background transition-colors"
                        >
                          <p className="text-sm font-medium">{v.kode}</p>
                          <p className="text-xs text-muted-foreground">
                            Potongan Rp {v.potongan.toLocaleString("id-ID")}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
            <Button className="w-full rounded-full h-12" size="lg" onClick={onCheckout}>
              Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}