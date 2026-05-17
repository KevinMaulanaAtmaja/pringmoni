"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface MenuFoto {
  id: number;
  fotoUrl: string;
}

interface Menu {
  id: number;
  namaMenu: string;
  harga: number;
  deskripsi: string | null;
  fotoUrl: string | null;
  menuFoto?: MenuFoto[];
  kategori: string;
  statusMenu: "tersedia" | "habis" | "nonaktif";
  jumlahDipesan?: number;
}

interface MenuCardProps {
  menu: Menu;
  onTambah?: (menu: Menu, jumlah: number, catatan: string | null) => void;
  onSuccess: () => void;
  jumlahDipesan?: number;
}

export function MenuCard({ menu, onTambah, onSuccess, jumlahDipesan }: MenuCardProps) {
  const isDisabled = menu.statusMenu !== "tersedia";
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use menuFoto for slider, fallback to fotoUrl
  const allImages = menu.menuFoto && menu.menuFoto.length > 0
    ? menu.menuFoto.map(f => f.fotoUrl)
    : (menu.fotoUrl ? [menu.fotoUrl] : []);
  const hasMultiple = allImages.length > 1;

  const handleReset = () => {
    setJumlah(1);
    setCatatan("");
    setCurrentImageIndex(0);
  };

  const handleImageNav = (direction: 'prev' | 'next') => {
    if (!hasMultiple) return;
    setCurrentImageIndex(prev => 
      direction === 'next' 
        ? (prev + 1) % allImages.length
        : (prev - 1 + allImages.length) % allImages.length
    );
  };

  const handleTambah = () => {
    onTambah?.(menu, jumlah, catatan || null);
    handleReset();
    onSuccess();
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleReset()}>
      <DialogTrigger asChild>
        <div
          className={`bg-card rounded-2xl overflow-hidden border transition-all ${
            isDisabled
              ? "opacity-60 pointer-events-none"
              : "hover:shadow-lg hover:border-primary/20 active:scale-95 cursor-pointer"
          }`}
        >
          {/* Image */}
          <div className="aspect-square w-full bg-muted flex items-center justify-center relative">
            {menu.fotoUrl ? (
              <img
                src={menu.fotoUrl}
                alt={menu.namaMenu}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">🍽️</span>
            )}
            {isDisabled && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 rounded-full text-xs"
              >
                Habis
              </Badge>
            )}
            {jumlahDipesan !== undefined && jumlahDipesan > 0 && (
              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {jumlahDipesan}x
              </div>
            )}
          </div>

          <div className="p-2.5">
            <h3 className="font-medium text-xs line-clamp-2">{menu.namaMenu}</h3>
            <p className="text-primary font-bold text-sm mt-1">
              Rp {menu.harga.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-sm rounded-3xl overflow-hidden p-0 gap-0" showCloseButton={true} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">{menu.namaMenu}</DialogTitle>
        {/* Image Slider */}
        <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-3xl relative">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[currentImageIndex]}
                alt={`${menu.namaMenu} ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={() => handleImageNav('prev')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageNav('next')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span className="text-6xl">🍽️</span>
          )}
        </div>

        <div className="p-5 pt-4">
          {/* Title & Price */}
          <h3 className="font-bold text-lg">{menu.namaMenu}</h3>
          <p className="text-primary font-bold text-xl mt-1">
            Rp {menu.harga.toLocaleString("id-ID")}
          </p>
          {menu.deskripsi && (
            <p className="text-sm text-muted-foreground mt-2">{menu.deskripsi}</p>
          )}

          {/* Catatan */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Catatan (opsional)</p>
            <input
              type="text"
              placeholder="Contoh: tanpa bawang, extra mayo..."
              className="w-full px-3 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          {/* Jumlah & Tombol */}
          <div className="mt-5 flex items-center gap-3">
            {/* Quantity Control */}
            <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
              <button
                onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
              >
                <Minus className="size-4" />
              </button>
              <span className="font-bold w-6 text-center">{jumlah}</span>
              <button
                onClick={() => setJumlah(jumlah + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Tombol Tambah */}
            <DialogClose asChild>
              <Button
                className="flex-1 rounded-full h-11"
                onClick={handleTambah}
                disabled={isDisabled}
              >
                Tambah Rp {(menu.harga * jumlah).toLocaleString("id-ID")}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}