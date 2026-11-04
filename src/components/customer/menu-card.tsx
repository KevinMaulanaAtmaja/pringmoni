"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ChevronLeft, ChevronRight, Flame, Snowflake } from "lucide-react";

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
  /** Kategori punya pilihan panas/dingin → tampilkan pemilih varian */
  pilihanSuhu?: boolean;
  /** Punya >= 1 bahan di resep → stok dilacak otomatis */
  adaResep?: boolean;
  /** Resep lengkap sesuai kategori: Makanan butuh bahan utama + bumbu, lainnya cukup bahan utama */
  resepLengkap?: boolean;
  porsiTersedia?: number;
  bahanPembatas?: string[];
}

interface MenuCardProps {
  menu: Menu;
  onTambah?: (menu: Menu, jumlah: number, catatan: string | null, varian?: string | null) => void;
  onSuccess: () => void;
  jumlahDipesan?: number;
}

export function MenuCard({ menu, onTambah, onSuccess, jumlahDipesan }: MenuCardProps) {
  const stockHabis = menu.statusMenu !== "tersedia";
  // Ketersediaan mengacu pada resep: menu hanya bisa dipesan bila resepnya
  // lengkap sesuai kategorinya (Makanan: bahan utama + bumbu; Minuman/Camilan:
  // cukup bahan utama). Resep kosong / tidak lengkap tetap tampil sebagai card,
  // tapi tidak bisa dipesan.
  const resepLengkap = menu.resepLengkap ?? false;
  const resepTidakSiap = !resepLengkap;
  const adaResep = menu.adaResep ?? false;
  const diKeranjang = Math.max(0, jumlahDipesan ?? 0);
  const porsiTersedia = Math.max(0, (menu.porsiTersedia ?? 0) - diKeranjang);
  // Porsi 0 (stok bahan dapur habis) juga membuat menu tidak bisa dipesan.
  const bahanHabis = adaResep && porsiTersedia <= 0;
  const isDisabled = stockHabis || resepTidakSiap || bahanHabis;
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Varian suhu hanya untuk kategori yang mencentang "bisa panas atau dingin".
  // Default: "Dingin" untuk menu berawalan "es", selain itu "Panas".
  const [varianSuhu, setVarianSuhu] = useState<"Panas" | "Dingin">(
    menu.namaMenu.toLowerCase().includes("es") ? "Dingin" : "Panas"
  );
  const punyaPilihanSuhu = menu.pilihanSuhu === true;
  // Jumlah per porsi tidak boleh melebihi sisa porsi yang tersedia, jadi
  // nilainya diderivate langsung (tidak perlu efek untuk menjepit).
  const jumlahValid = bahanHabis ? 1 : Math.min(jumlah, Math.max(1, porsiTersedia));
  // Angka "sisa porsi" di dialog ikut turun tiap kali tombol + ditekan,
  // karena porsi yang sedang dipilih sudah dianggap terpakai.
  const porsiSetelahTambah = Math.max(0, porsiTersedia - jumlahValid);

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
    if (isDisabled) return;
    onTambah?.(menu, jumlahValid, catatan || null, punyaPilihanSuhu ? varianSuhu : null);
    handleReset();
    onSuccess();
  };

  return (
    <Dialog onOpenChange={(open) => !open && handleReset()}>
      <DialogTrigger asChild>
        <div
          className={`bg-card rounded-2xl overflow-hidden border transition-all cursor-pointer ${
            isDisabled
              ? "border-destructive/30"
              : "hover:shadow-lg hover:border-primary/20 active:scale-95"
          }`}
        >
          {/* Image */}
          <div className="aspect-square w-full bg-muted flex items-center justify-center relative">
            {menu.fotoUrl ? (
              <Image
                src={menu.fotoUrl}
                alt={menu.namaMenu}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover ${isDisabled ? "opacity-40 grayscale" : ""}`}
                loading="lazy"
              />
            ) : (
              <span className={`text-4xl ${isDisabled ? "opacity-40 grayscale" : ""}`}>🍽️</span>
            )}
            {isDisabled && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 rounded-full bg-background text-xs font-bold text-destructive shadow-sm ring-1 ring-destructive/40"
              >
                {bahanHabis                   ? "Habis"
                    : "Habis"}
              </Badge>
            )}
            {!isDisabled && adaResep && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 rounded-full border-primary/40 bg-background/90 text-[11px] font-semibold text-primary backdrop-blur-sm"
              >
                Sisa {porsiTersedia} porsi
              </Badge>
            )}
            {jumlahDipesan !== undefined && jumlahDipesan > 0 && (
              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                {jumlahDipesan}x
              </div>
            )}
          </div>

          <div className={`p-2.5 ${isDisabled ? "opacity-60" : ""}`}>
            <h3 className="font-medium text-sm line-clamp-2">{menu.namaMenu}</h3>
            <p className="text-primary font-bold text-sm mt-1">
              Rp {menu.harga.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[92dvh] max-w-sm rounded-3xl overflow-hidden p-0 gap-0 grid grid-rows-[auto_minmax(0,1fr)]" showCloseButton={true} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">{menu.namaMenu}</DialogTitle>
        {/* Image Slider */}
        <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-3xl relative shrink-0">
          {allImages.length > 0 ? (
            <>
              <Image
                src={allImages[currentImageIndex]}
                alt={`${menu.namaMenu} ${currentImageIndex + 1}`}
                fill
                sizes="(max-width: 640px) 90vw, 448px"
                className="object-cover"
                loading="lazy"
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

        <div className="p-5 pt-4 overflow-y-auto min-h-0">
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg">{menu.namaMenu}</h3>
            {(adaResep || isDisabled) && (
              <Badge
                variant="outline"
                title={
                  isDisabled
                    ? "Menu ini sedang tidak dapat dipesan"
                    : "Sisa porsi setelah pesanan ini ditambahkan"
                }
                className={
                  isDisabled
                    ? "shrink-0 text-destructive border-destructive/40"
                    : porsiTersedia <= 5
                      ? "shrink-0 text-amber-700 border-amber-300"
                      : "shrink-0 text-primary border-primary/40"
                }
              >
                {isDisabled
                  ? bahanHabis
                ? "Habis"
              : "Habis"
                  : `Sisa ${porsiSetelahTambah} porsi`}
              </Badge>
            )}
          </div>
          <p className="text-primary font-bold text-xl mt-1">
            Rp {menu.harga.toLocaleString("id-ID")}
          </p>
          {menu.deskripsi && (
            <p className="text-sm text-muted-foreground mt-2">{menu.deskripsi}</p>
          )}

          {adaResep && (menu.bahanPembatas?.length ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Stok bahan terbatas: {menu.bahanPembatas?.join(", ")}
            </p>
          )}

          {isDisabled ? (
            /* Menu habis: tidak ada kontrol pemesanan sama sekali */
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4 text-center">
              <p className="text-sm font-semibold text-destructive">
                {bahanHabis ? "Habis" : "Habis"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {bahanHabis
                  ? "Bahan untuk menu ini sedang habis. Silakan pilih menu lain."
                  : "Menu ini sedang tidak tersedia. Silakan pilih menu lain."}
              </p>
            </div>
          ) : (
            <>
              {/* Pilihan panas / dingin (hanya untuk kategori yang mengaktifkan) */}
              {punyaPilihanSuhu && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Suhu</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "Panas", icon: Flame },
                      { key: "Dingin", icon: Snowflake },
                    ] as const).map(({ key, icon: SuhuIcon }) => {
                      const aktif = varianSuhu === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setVarianSuhu(key)}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                            aktif
                              ? "border-primary bg-primary/10 text-primary"
                              : "bg-background hover:bg-muted"
                          }`}
                        >
                          <SuhuIcon className="size-4" />
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>
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
                    onClick={() => setJumlah(Math.max(1, jumlahValid - 1))}
                    disabled={jumlahValid <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-bold w-6 text-center">{jumlahValid}</span>
                  <button
                    onClick={() => setJumlah(jumlahValid + 1)}
                    disabled={adaResep && jumlahValid >= porsiTersedia}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={
                      adaResep && jumlahValid >= porsiTersedia
                        ? `Maksimal ${porsiTersedia} porsi sesuai stok bahan`
                        : undefined
                    }
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Tombol Tambah */}
                <DialogClose asChild>
                  <Button
                    className="flex-1 rounded-full h-11"
                    onClick={handleTambah}
                  >
                    Tambah Rp {(menu.harga * jumlahValid).toLocaleString("id-ID")}
                  </Button>
                </DialogClose>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}