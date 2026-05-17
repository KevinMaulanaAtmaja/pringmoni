"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCard } from "@/components/customer/menu-card";
import { CartSheet } from "@/components/customer/cart-sheet";
import { Search, ShoppingCart, Camera, X } from "lucide-react";
import { getMenusForCustomer, getMejaByToken, createPesanan } from "@/app/actions/pesanan";
import { getKategoriMenus } from "@/app/actions/menu";
import type { CustomerMenu } from "@/types";
import type { KeranjangItem } from "@/components/customer/cart-sheet";

type Menu = CustomerMenu;

interface CreatePesananResult {
    success?: boolean;
    orderId?: string | null;
    error?: string;
}

export default function CustomerMenuPage() {
    const router = useRouter();
    const params = useParams();
    const tokenMeja = params.tokenMeja as string;
const [menus, setMenus] = useState<Menu[]>([]);
const [mejaData, setMejaData] = useState<{ nomorMeja: string } | null>(null);
const [kategoris, setKategoris] = useState<{ id: number; nama: string }[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
    const [keranjang, setKeranjang] = useState<KeranjangItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [showToastBerhasil, setShowToastBerhasil] = useState(false);
    const [sudahPesan, setSudahPesan] = useState(false);
    const [totalCheckout, setTotalCheckout] = useState(0);
    const [activeKategori, setActiveKategori] = useState("Semua");
    const [searchQuery, setSearchQuery] = useState("");

    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [itemsToShow, setItemsToShow] = useState(12);
    const [showScanner, setShowScanner] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerRef = useRef<{ stream?: MediaStream; detector?: any }>({});

    interface Voucher {
        kode: string;
        potongan: number;
        minPembelian: number;
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Validasi token meja
                 const meja = await getMejaByToken(tokenMeja);
                 if (!meja) {
                     setError("Token meja salah. Silahkan scan QR code meja lagi.");
                     setLoading(false);
                     return;
                 }
                setMejaData(meja);
                
                const [menuData, kategoriData] = await Promise.all([
                    getMenusForCustomer(),
                    getKategoriMenus()
                ]);
                setMenus(menuData);
                setKategoris([
                    { id: 0, nama: "Semua" },
                    ...kategoriData.map((kat) => ({ id: kat.id, nama: kat.namaKategori }))
                ]);
                setLoading(false);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
                setLoading(false);
            }
        };
        loadData();
    }, [tokenMeja]);

    const filteredMenu = menus.filter((menu) => {
        const matchKategori = activeKategori === "Semua" || menu.kategori === activeKategori;
        const matchSearch = menu.namaMenu.toLowerCase().includes(searchQuery.toLowerCase());
        return matchKategori && matchSearch;
    });

    const displayedMenu = filteredMenu.slice(0, itemsToShow);
    const hasMore = filteredMenu.length > itemsToShow;

    const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
    const subtotal = keranjang.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

    // Validasi voucher: reset jika subtotal < minPembelian
    const effectiveVoucher = voucher && subtotal >= voucher.minPembelian ? voucher : null;
    const totalHarga = effectiveVoucher ? subtotal - effectiveVoucher.potongan : subtotal;

    const tambahKeranjang = (menu: Menu, jumlah: number = 1, catatan: string | null = null) => {
        setKeranjang((prev) => {
            // Cek jika ada item dengan menu yang sama dan catatan yang sama
            const existing = prev.find((item) => item.id === menu.id && item.catatan === catatan);
            if (existing) {
                return prev.map((item) =>
                    item.id === menu.id && item.catatan === catatan ? { ...item, jumlah: item.jumlah + jumlah } : item,
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
                prev.map((item) => (`${item.id}-${item.catatan || "no-note"}` === key ? { ...item, jumlah } : item)),
            );
        }
    };

    const hapusDariKeranjang = (key: string) => {
        setKeranjang((prev) => prev.filter((item) => `${item.id}-${item.catatan || "no-note"}` !== key));
    };

    const handleCheckout = async () => {
        if (keranjang.length === 0) return;
        setSubmitting(true);

        try {
            const items = keranjang.map((item) => ({
                menuId: item.id,
                jumlah: item.jumlah,
                catatan: item.catatan,
            }));

            const result: CreatePesananResult = await createPesanan({ tokenMeja, items });

            if (result && 'error' in result) {
                alert(result.error);
                setSubmitting(false);
                return;
            }

            if (result && 'orderId' in result && result.orderId) {
                router.push(`/${tokenMeja}/checkout?orderId=${result.orderId}`);
            } else {
                alert("Pesanan berhasil dibuat!");
                setKeranjang([]);
                setSubmitting(false);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Terjadi kesalahan");
            setSubmitting(false);
        }
    };

    const handleLihatPesanan = () => {
        router.push("pesanan");
    };

    const startScanner = async () => {
        setScanError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                scannerRef.current.stream = stream;
            }

            if ("BarcodeDetector" in window) {
                const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
                scannerRef.current.detector = detector;
                detectQR(detector, stream);
            }
        } catch {
            setScanError("Tidak dapat mengakses kamera. Masukkan token secara manual.");
        }
    };

    const detectQR = async (detector: any, stream: MediaStream) => {
        try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
                const token = barcodes[0].rawValue.split("/").pop() || barcodes[0].rawValue;
                stopScanner();
                window.location.href = `/${token}`;
                return;
            }
            requestAnimationFrame(() => detectQR(detector, stream));
        } catch {
            // continue scanning
        }
    };

    const stopScanner = () => {
        scannerRef.current.stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        scannerRef.current = {};
        setShowScanner(false);
    };

    const handleManualToken = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const token = formData.get("token") as string;
        if (token) {
            window.location.href = `/${token.trim()}`;
        }
    };

    useEffect(() => {
        if (showScanner) {
            startScanner();
        }
        return () => stopScanner();
    }, [showScanner]);

return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-2xl mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h1 className="font-heading text-xl font-bold">Pringmoni</h1>
                        {!error && (
                            <Badge variant="outline" className="rounded-full">
                                 Meja {mejaData?.nomorMeja || tokenMeja}
                             </Badge>
                        )}
                    </div>

                    {!loading && !error && (
                     <CartSheet
                              keranjang={keranjang}
                              onUpdateJumlah={updateJumlah}
                              onHapus={hapusDariKeranjang}
                              onCheckout={handleCheckout}
                              submitting={submitting}
                              subtotal={subtotal}
                             totalHarga={totalHarga}
                             voucher={effectiveVoucher}
                             onApplyVoucher={setVoucher}
                         >
                             <Button variant="outline" size="icon" className="relative" data-cart-button>
                                 <ShoppingCart className="size-5" />
                                 {totalItem > 0 && (
                                     <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                         {totalItem}
                                     </span>
                                 )}
                             </Button>
                         </CartSheet>
                     )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-muted-foreground">Memuat menu...</p>
                    </div>
                )}

                {error && (
                    <Card className="py-12 border-destructive">
                        <CardContent className="text-center">
                            <div className="mb-4">
                                <p className="text-destructive font-semibold text-lg mb-2">Token Tidak Valid</p>
                                <p className="text-muted-foreground mb-2">{error}</p>
                            </div>

                            {!showScanner ? (
                                <Button variant="outline" onClick={() => setShowScanner(true)}>
                                    <Camera className="size-4 mr-2" />
                                    Scan QR Lagi
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative mx-auto max-w-sm overflow-hidden rounded-lg border bg-black">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full aspect-square object-cover"
                                        />
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-2 rounded-full"
                                            onClick={stopScanner}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>

                                    {scanError && (
                                        <p className="text-sm text-destructive">{scanError}</p>
                                    )}

                                    <form onSubmit={handleManualToken} className="flex gap-2 max-w-sm mx-auto">
                                        <Input
                                            name="token"
                                            placeholder="Atau masukkan token manual"
                                            className="flex-1"
                                        />
                                        <Button type="submit" size="sm">Cek</Button>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && (
                    <>
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari menu..."
                                className="pl-10 rounded-full bg-muted/50"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setItemsToShow(12);
                                }}
                            />
                        </div>

                        {/* Kategori - Pill buttons */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {kategoris.map((kat) => (
                                <Button
                                    key={kat.id}
                                    variant={activeKategori === kat.nama ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full px-4 shrink-0"
                                    onClick={() => {
                                    setActiveKategori(kat.nama);
                                    setItemsToShow(12);
                                }}
                                >
                                    {kat.nama}
                                </Button>
                            ))}
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {displayedMenu.map((menu) => {
                                const itemKeranjang = keranjang.find((k) => k.id === menu.id);
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

                        {hasMore && (
                            <div className="mt-4 text-center">
                                <Button
                                    variant="outline"
                                    className="rounded-full px-6"
                                    onClick={() => setItemsToShow((prev) => prev + 12)}
                                >
                                    Tampilkan Lainnya ({filteredMenu.length - itemsToShow} menu)
                                </Button>
                            </div>
                        )}

                        {filteredMenu.length === 0 && (
                            <Card className="py-12">
                                <CardContent className="text-center text-muted-foreground">
                                    <p>Menu tidak ditemukan</p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>

            {/* Bottom Cart Bar (Mobile) */}
            {!loading && !error && keranjang.length > 0 && !sudahPesan && (
                <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {totalItem} item{voucher && <span className="text-green-600"> + Voucher</span>}
                            </p>
                            <p className="text-lg font-bold">Rp {totalHarga.toLocaleString("id-ID")}</p>
                        </div>
                        <Button
                            className="rounded-full px-6"
                            onClick={() => {
                                document.querySelector<HTMLButtonElement>("[data-cart-button]")?.click();
                            }}
                        >
                            Checkout
                        </Button>
                    </div>
                </div>
            )}

            {/* Bottom Pesanan Berhasil */}
            {!loading && !error && sudahPesan && (
                <div className="fixed bottom-0 left-0 right-0 border-t bg-primary text-primary-foreground p-4 md:hidden">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Pesanan Diproses</p>
                            <p className="text-lg font-bold">Rp {totalCheckout.toLocaleString("id-ID")}</p>
                        </div>
                        <Button variant="secondary" className="rounded-full px-6" onClick={handleLihatPesanan}>
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
