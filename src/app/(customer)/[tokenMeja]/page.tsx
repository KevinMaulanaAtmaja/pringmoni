"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCard } from "@/components/customer/menu-card";
import { CartSheet } from "@/components/customer/cart-sheet";
import { Search, ShoppingCart, Camera, X, AlertTriangle } from "lucide-react";
import { getCustomerMenuData, getMejaByToken, getStatusPesananAktifMeja } from "@/app/actions/pesanan";
import { simpanKeranjangCheckout, ambilKeranjangCheckout } from "@/lib/checkout-storage";
import type { CustomerMenu } from "@/types";
import type { KeranjangItem } from "@/components/customer/cart-sheet";

type Menu = CustomerMenu;

export default function CustomerMenuPage() {
    const router = useRouter();
    const params = useParams();
    const tokenMeja = params.tokenMeja as string;
const [menus, setMenus] = useState<Menu[]>([]);
const [mejaData, setMejaData] = useState<{ nomorMeja: string; statusMeja: string } | null>(null);
const [kategoris, setKategoris] = useState<{ id: number; nama: string }[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
    const [keranjang, setKeranjang] = useState<KeranjangItem[]>([]);
    const [showToastBerhasil, setShowToastBerhasil] = useState(false);
    const [menuHabisTerhapus, setMenuHabisTerhapus] = useState<string[]>([]);
    const [activeKategori, setActiveKategori] = useState("Semua");
    const [searchQuery, setSearchQuery] = useState("");

    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [itemsToShow, setItemsToShow] = useState(12);
    const [showScanner, setShowScanner] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [manualTokenLoading, setManualTokenLoading] = useState(false);
    const [manualTokenError, setManualTokenError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [scanResultError, setScanResultError] = useState<string | null>(null);
    const [mejaTerpakaiWarning, setMejaTerpakaiWarning] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerRef = useRef<{ stream?: MediaStream }>({});

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

                const [data, statusAktif] = await Promise.all([
                    getCustomerMenuData(tokenMeja),
                    getStatusPesananAktifMeja(tokenMeja),
                ]);

                if (!data.meja) {
                    setError("Token meja salah. Silahkan scan QR code meja lagi.");
                    setLoading(false);
                    return;
                }
                if (statusAktif?.sudahPilihMetode) {
                    setError("Masih ada pesanan yang menunggu pembayaran. Selesaikan pembayaran terlebih dahulu sebelum memesan lagi.");
                    setLoading(false);
                    return;
                }
                if (data.meja.statusMeja === 'terpakai') {
                    setMejaTerpakaiWarning(true);
                }
                setMejaData(data.meja);

                setMenus(data.menus);
                setKategoris([
                    { id: 0, nama: "Semua" },
                    ...data.kategoris.map((kat) => ({ id: kat.id, nama: kat.namaKategori }))
                ]);
                setLoading(false);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
                setLoading(false);
            }
        };
        loadData();
    }, [tokenMeja]);

    // Pulihkan keranjang dari checkout yang belum selesai agar tidak hilang
    // saat customer kembali dari halaman checkout.
    useEffect(() => {
        const saved = ambilKeranjangCheckout();
        if (saved && saved.length > 0) {
            setKeranjang(saved);
        }
    }, []);

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
        // Jaring pengaman: menu habis / resep belum lengkap / porsi habis
        // tidak boleh masuk keranjang, meski data di dialog sudah basi.
        if (menu.statusMenu !== "tersedia") return;
        if (!menu.resepLengkap) return;
        if (menu.adaResep && (menu.porsiTersedia ?? 0) <= 0) return;
        setKeranjang((prev) => {
            // Total porsi menu ini yang sudah ada di keranjang (semua catatan),
            // supaya tidak melebihi sisa porsi meski dipecah jadi beberapa catatan.
            const terpakai = prev
                .filter((item) => item.id === menu.id)
                .reduce((sum, item) => sum + item.jumlah, 0);
            const maksTambah = menu.adaResep ? Math.max(1, (menu.porsiTersedia ?? 0) - terpakai) : jumlah;
            const jumlahFinal = Math.min(jumlah, maksTambah);

            // Cek jika ada item dengan menu yang sama dan catatan yang sama
            const existing = prev.find((item) => item.id === menu.id && item.catatan === catatan);
            if (existing) {
                return prev.map((item) =>
                    item.id === menu.id && item.catatan === catatan ? { ...item, jumlah: item.jumlah + jumlahFinal } : item,
                );
            }
            return [...prev, { ...menu, jumlah: jumlahFinal, catatan }];
        });
    };

    const handleMenuDitambahkan = () => {
        setShowToastBerhasil(true);
        setTimeout(() => setShowToastBerhasil(false), 2000);
    };

    const updateJumlah = (key: string, jumlah: number) => {
        if (jumlah <= 0) {
            setKeranjang((prev) => prev.filter((item) => `${item.id}-${item.catatan || "no-note"}` !== key));
            return;
        }
        setKeranjang((prev) =>
            prev.map((item) => {
                if (`${item.id}-${item.catatan || "no-note"}` !== key) return item;
                // Jangan melebihi sisa porsi dari resep bahan (mode otomatis).
                const maks = item.adaResep ? item.porsiTersedia ?? 0 : jumlah;
                return { ...item, jumlah: Math.min(jumlah, Math.max(maks, 1)) };
            }),
        );
    };

    const hapusDariKeranjang = (key: string) => {
        setKeranjang((prev) => prev.filter((item) => `${item.id}-${item.catatan || "no-note"}` !== key));
    };

    const handleCheckout = async () => {
        if (keranjang.length === 0) return;

        // Validasi ulang stok terbaru sebelum masuk checkout: menu yang sudah
        // habis dibuang dari keranjang supaya customer tidak bisa pesan.
        try {
            const data = await getCustomerMenuData(tokenMeja);
            const menuMap = new Map(data.menus.map((m) => [m.id, m]));
            const keranjangValid: KeranjangItem[] = [];
            const dihapus: string[] = [];

            for (const item of keranjang) {
                const menu = menuMap.get(item.id);
                const porsi = menu?.porsiTersedia ?? 0;
                const habis =
                    !menu ||
                    menu.statusMenu !== "tersedia" ||
                    menu.resepLengkap !== true ||
                    (menu.adaResep === true && porsi <= 0);

                if (habis) {
                    dihapus.push(item.namaMenu);
                    continue;
                }

                const maks = menu.adaResep === true ? porsi : item.jumlah;
                const jumlahBaru = Math.min(item.jumlah, Math.max(1, maks));
                keranjangValid.push({
                    ...item,
                    jumlah: jumlahBaru,
                    adaResep: menu.adaResep,
                    porsiTersedia: porsi,
                });
            }

            if (dihapus.length > 0) {
                setMenuHabisTerhapus(dihapus);
                setTimeout(() => setMenuHabisTerhapus([]), 4000);
            }

            if (keranjangValid.length === 0) {
                setKeranjang([]);
                return;
            }

            setKeranjang(keranjangValid);
            simpanKeranjangCheckout(keranjangValid);
            router.push(`/${tokenMeja}/checkout`);
        } catch {
            // Jika validasi daring gagal, tetap lanjut — createPesanan tetap
            // jadi gerbang terakhir di server.
            simpanKeranjangCheckout(keranjang);
            router.push(`/${tokenMeja}/checkout`);
        }
    };

    const startScanner = async () => {
        setScanError(null);
        setScanResultError(null);
        setValidating(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                scannerRef.current.stream = stream;
            }
        } catch {
            setScanError("Tidak dapat mengakses kamera. Masukkan token secara manual.");
        }
    };

    const stopCamera = () => {
        scannerRef.current.stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        scannerRef.current = {};
    };

    const handleAmbilFoto = async () => {
        if (!videoRef.current || !scannerRef.current.stream) return;
        videoRef.current.pause();

        setValidating(true);
        setScanResultError(null);

        const video = videoRef.current;
        if (!video.videoWidth || !video.videoHeight) {
            setValidating(false);
            setScanResultError("Kamera belum siap. Coba lagi.");
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            setValidating(false);
            setScanResultError("Gagal memproses gambar.");
            return;
        }

        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { default: jsQR } = await import("jsqr");
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (!code) {
            setValidating(false);
            setScanResultError("QR tidak terdeteksi. Coba ambil foto lagi.");
            return;
        }

        const rawUrl = code.data.trim();
        const parts = rawUrl.split("/").filter(Boolean);
        const token = parts.pop() || rawUrl;

        try {
            const meja = await getMejaByToken(token);
            if (meja) {
                stopCamera();
                router.push(`/${token}`);
            } else {
                setValidating(false);
                setScanResultError("Token tidak valid. Silahkan scan QR code yang benar.");
            }
        } catch {
            setValidating(false);
            setScanResultError("Terjadi kesalahan validasi. Silahkan coba lagi.");
        }
    };

    const handleCobaLagi = () => {
        stopCamera();
        setScanResultError(null);
        setValidating(false);
        startScanner();
    };

    const handleCloseScanner = () => {
        stopCamera();
        setShowScanner(false);
        setScanResultError(null);
        setValidating(false);
    };

    const handleManualToken = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const token = formData.get("token") as string;
        if (!token) return;

        setManualTokenLoading(true);
        setManualTokenError(null);

        try {
            const meja = await getMejaByToken(token.trim());
            if (meja) {
                window.location.href = `/${token.trim()}`;
            } else {
                setManualTokenError("Token meja tidak valid. Silahkan cek kembali.");
                setManualTokenLoading(false);
            }
        } catch {
            setManualTokenError("Terjadi kesalahan. Silahkan coba lagi.");
            setManualTokenLoading(false);
        }
    };

    useEffect(() => {
        if (showScanner) {
            (async () => { await startScanner(); })();
        }
        return () => stopCamera();
    }, [showScanner]);

return (
        <div className="bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h1 className="font-heading text-xl font-bold">Pringmoni</h1>
                        {!error && !loading && (
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
            <main className="max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-6">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="relative h-10 w-10">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
                        </div>
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
                                            onClick={handleCloseScanner}
                                        >
                                            <X className="size-4" />
                                        </Button>

                                        {validating && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-2" />
                                                <p className="text-white text-sm font-medium">Memvalidasi token...</p>
                                            </div>
                                        )}
                                    </div>

                                    {scanError && (
                                        <p className="text-sm text-destructive">{scanError}</p>
                                    )}

                                    {!validating && !scanResultError && (
                                        <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                            <Button onClick={handleAmbilFoto} className="w-full">
                                                <Camera className="size-4 mr-2" />
                                                Ambil Foto
                                            </Button>
                                            <form onSubmit={handleManualToken} className="flex gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <Input
                                                        name="token"
                                                        placeholder="Atau masukkan token manual"
                                                        className="w-full"
                                                    />
                                                    {manualTokenError && (
                                                        <p className="text-xs text-destructive text-left">{manualTokenError}</p>
                                                    )}
                                                </div>
                                                <Button type="submit" size="sm" disabled={manualTokenLoading}>
                                                    {manualTokenLoading ? "..." : "Cek"}
                                                </Button>
                                            </form>
                                        </div>
                                    )}

                                    {scanResultError && (
                                        <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                            <p className="text-sm text-destructive">{scanResultError}</p>
                                            <Button variant="outline" onClick={handleCobaLagi}>
                                                <Camera className="size-4 mr-2" />
                                                Coba Lagi
                                            </Button>
                                            <form onSubmit={handleManualToken} className="flex gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <Input
                                                        name="token"
                                                        placeholder="Atau masukkan token manual"
                                                        className="w-full"
                                                    />
                                                    {manualTokenError && (
                                                        <p className="text-xs text-destructive text-left">{manualTokenError}</p>
                                                    )}
                                                </div>
                                                <Button type="submit" size="sm" disabled={manualTokenLoading}>
                                                    {manualTokenLoading ? "..." : "Cek"}
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && (
                    <>
                        {mejaTerpakaiWarning && (
                            <Card className="mb-4 border-yellow-400 bg-yellow-50">
                                <CardContent className="flex items-start gap-3 py-3">
                                    <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-yellow-800">Meja Sedang Digunakan</p>
                                        <p className="text-xs text-yellow-700">Meja ini sedang dipakai oleh pelanggan lain. Silahkan hubungi staff jika ada pertanyaan.</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => setMejaTerpakaiWarning(false)}>
                                        <X className="size-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {displayedMenu.map((menu) => {
                                // Jumlah di keranjang dijumlahkan dari semua baris
                                // (menu yang sama bisa punya catatan berbeda).
                                const jumlahDipesan = keranjang
                                    .filter((k) => k.id === menu.id)
                                    .reduce((sum, k) => sum + k.jumlah, 0);
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
            {!loading && !error && keranjang.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 lg:hidden">
                    <div className="max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto flex items-center justify-between">
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

            {/* Toast Menu Habis Dihapus dari Keranjang */}
            {menuHabisTerhapus.length > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-destructive text-destructive-foreground shadow-lg py-2 px-3 rounded-full">
                        <CardContent className="flex items-center gap-2 p-0">
                            <span className="text-xs">
                                {menuHabisTerhapus.length === 1
                                    ? `${menuHabisTerhapus[0]} habis dan dihapus dari keranjang`
                                    : `${menuHabisTerhapus.length} menu habis dan dihapus dari keranjang`}
                            </span>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
