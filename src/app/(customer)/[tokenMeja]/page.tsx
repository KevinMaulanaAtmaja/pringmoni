"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCard } from "@/components/customer/menu-card";
import { CartSheet } from "@/components/customer/cart-sheet";
import { Search, ShoppingCart } from "lucide-react";

interface Menu {
  id: number;
  namaMenu: string;
  harga: number;
  deskripsi?: string;
  fotoUrl?: string;
  kategori: string;
  statusMenu: "tersedia" | "habis" | "nonaktif";
}

interface KeranjangItem extends Menu {
  jumlah: number;
  catatan?: string;
}

const sampleKategori = [
  { id: 1, nama: "Semua" },
  { id: 2, nama: "Makanan" },
  { id: 3, nama: "Minuman" },
  { id: 4, nama: "Snack" },
];

const sampleMenu: Menu[] = [
  {
    id: 1,
    namaMenu: "Nasi Goreng Spesial",
    harga: 25000,
    deskripsi: "Nasi goreng dengan telur, ayam, dan sayuran",
    kategori: "Makanan",
    statusMenu: "tersedia",
  },
  {
    id: 2,
    namaMenu: "Ayam Geprek",
    harga: 22000,
    deskripsi: "Ayam crispy dengan sambal spesial",
    kategori: "Makanan",
    statusMenu: "tersedia",
  },
  {
    id: 3,
    namaMenu: "Es Teh Manis",
    harga: 5000,
    kategori: "Minuman",
    statusMenu: "tersedia",
  },
  {
    id: 4,
    namaMenu: "Es Jeruk",
    harga: 6000,
    kategori: "Minuman",
    statusMenu: "tersedia",
  },
  {
    id: 5,
    namaMenu: "Pisang Goreng",
    harga: 12000,
    kategori: "Snack",
    statusMenu: "tersedia",
  },
  {
    id: 6,
    namaMenu: "Indomie Goreng",
    harga: 15000,
    deskripsi: "Indomie goreng telur",
    kategori: "Makanan",
    statusMenu: "habis",
  },
];

export default function CustomerMenuPage() {
  const router = useRouter();
  const [keranjang, setKeranjang] = useState<KeranjangItem[]>([]);
  const [showToastBerhasil, setShowToastBerhasil] = useState(false);
  const [sudahPesan, setSudahPesan] = useState(false);
  const [totalCheckout, setTotalCheckout] = useState(0);
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenu = sampleMenu.filter((menu) => {
    const matchKategori =
      activeKategori === "Semua" || menu.kategori === activeKategori;
    const matchSearch = menu.namaMenu
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchKategori && matchSearch;
  });

  const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
  const totalHarga = keranjang.reduce(
    (sum, item) => sum + item.harga * item.jumlah,
    0
  );

  const tambahKeranjang = (menu: Menu, jumlah: number = 1, catatan: string = "") => {
    setKeranjang((prev) => {
      // Cek jika ada item dengan menu yang sama dan catatan yang sama
      const existing = prev.find(
        (item) => item.id === menu.id && item.catatan === catatan
      );
      if (existing) {
        return prev.map((item) =>
          item.id === menu.id && item.catatan === catatan
            ? { ...item, jumlah: item.jumlah + jumlah }
            : item
        );
      }
      return [...prev, { ...menu, jumlah, catatan }];
    });
  };

  const handleMenuDitambahkan = () => {
    setShowToastBerhasil(true);
    setTimeout(() => setShowToastBerhasil(false), 2000);
  };

  const updateJumlah = (key: string, jumlah: number) => {
    if (jumlah <= 0) {
      setKeranjang((prev) => prev.filter((item) => `${item.id}-${item.catatan || "no-note"}` !== key));
    } else {
      setKeranjang((prev) =>
        prev.map((item) =>
          `${item.id}-${item.catatan || "no-note"}` === key ? { ...item, jumlah } : item
        )
      );
    }
  };

  const hapusDariKeranjang = (key: string) => {
    setKeranjang((prev) => prev.filter((item) => `${item.id}-${item.catatan || "no-note"}` !== key));
  };

  const handleCheckout = () => {
    if (keranjang.length === 0) return;

    const totalHarga = keranjang.reduce(
      (sum, item) => sum + item.harga * item.jumlah,
      0
    );
    const pesanan = {
      id: Date.now().toString(),
      items: keranjang,
      totalHarga,
      status: "menunggu" as const,
      waktu: new Date(),
    };
    localStorage.setItem("lastPesanan", JSON.stringify(pesanan));

    setTotalCheckout(totalHarga);
    setSudahPesan(true);
  };

  const handleLihatPesanan = () => {
    router.push("pesanan");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold">Pringmoni</h1>
            <Badge variant="outline" className="rounded-full">Meja 01</Badge>
          </div>

          <CartSheet
            keranjang={keranjang}
            onUpdateJumlah={updateJumlah}
            onHapus={hapusDariKeranjang}
            onCheckout={handleCheckout}
          >
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="size-5" />
              {totalItem > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {totalItem}
                </span>
              )}
            </Button>
          </CartSheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari menu..."
            className="pl-10 rounded-full bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Kategori - Pill buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {sampleKategori.map((kat) => (
            <Button
              key={kat.id}
              variant={activeKategori === kat.nama ? "default" : "outline"}
              size="sm"
              className="rounded-full px-4 shrink-0"
              onClick={() => setActiveKategori(kat.nama)}
            >
              {kat.nama}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-3 gap-3">
          {filteredMenu.map((menu) => {
            const itemKeranjang = keranjang.find(k => k.id === menu.id);
            const jumlahDipesan = itemKeranjang?.jumlah || 0;
            return (
              <MenuCard
                key={menu.id}
                menu={menu}
                onTambah={tambahKeranjang}
                onSuccess={handleMenuDitambahkan}
                jumlahDipesan={jumlahDipesan}
              />
            );
          })}
        </div>

        {filteredMenu.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              <p>Menu tidak ditemukan</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Cart Bar (Mobile) */}
      {keranjang.length > 0 && !sudahPesan && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {totalItem} item
              </p>
              <p className="text-lg font-bold">
                Rp {totalHarga.toLocaleString("id-ID")}
              </p>
            </div>
            <Button className="rounded-full px-6" onClick={handleCheckout}>
              Pesan
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Pesanan Berhasil */}
      {sudahPesan && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-primary text-primary-foreground p-4 md:hidden">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pesanan Diproses</p>
              <p className="text-lg font-bold">
                Rp {totalCheckout.toLocaleString("id-ID")}
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="rounded-full px-6" 
              onClick={handleLihatPesanan}
            >
              Lihat Pesanan
            </Button>
          </div>
        </div>
      )}

      {/* Toast Menu Ditambahkan */}
      {showToastBerhasil && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Card className="bg-primary text-primary-foreground shadow-lg py-2 px-3 rounded-full">
            <CardContent className="flex items-center gap-2 p-0">
              <span className="text-xs">Menu ditambahkan</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}