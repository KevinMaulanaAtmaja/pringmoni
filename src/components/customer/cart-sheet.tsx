"use client";

import { useState } from "react";
import { Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

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
}

function getItemKey(item: KeranjangItem): string {
  return `${item.id}-${item.catatan || "no-note"}`;
}

export function CartSheet({
  children,
  keranjang,
  onUpdateJumlah,
  onHapus,
  onCheckout,
}: CartSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalHarga = keranjang.reduce(
    (sum, item) => sum + item.harga * item.jumlah,
    0
  );
  const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="border-b pb-4 pr-8">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              Keranjang
            </SheetTitle>
            <span className="absolute left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
              {totalItem} item
            </span>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {keranjang.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
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
                            📝 {item.catatan}
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

                    {/* Quantity Controls */}
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

        {/* Footer - Total & Checkout */}
        {keranjang.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="space-y-3 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-lg">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </span>
              </div>
              <Button className="w-full rounded-full h-12" size="lg" onClick={onCheckout}>
                Pesan Sekarang
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}