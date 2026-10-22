"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCard } from "@/components/customer/menu-card";
import { CartSheet } from "@/components/customer/cart-sheet";
import { PindahMejaSheet } from "@/components/customer/pindah-meja-sheet";
import { Search, ShoppingCart, Camera, X, AlertTriangle, Coffee, Utensils, UtensilsCrossed, GlassWater, Cookie, Package, ChevronDown, ArrowLeft, ArrowRightLeft, Ticket, Tag, Pizza, Hamburger, Sandwich, Carrot, Drumstick, Fish, Shrimp, Soup, Wheat, Salad, IceCream, CakeSlice, Popcorn, CupSoda, Boxes, ChefHat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCustomerMenuData, getMejaByToken, getStatusPesananAktifMeja } from "@/app/actions/pesanan";
import { getVoucherAktif } from "@/app/actions/voucher";
import { simpanKeranjangCheckout, simpanKodeVoucher } from "@/lib/checkout-storage";
import { hitungPotonganDiskon } from "@/lib/voucher";
import type { CustomerMenu } from "@/types";
import type { VoucherOpsi, VoucherTerpakai } from "@/types";
import type { KeranjangItem } from "@/components/customer/cart-sheet";

type Menu = CustomerMenu;

export default function CustomerMenuPage() {
    const router = useRouter();
    const params = useParams();
    const tokenMeja = params.tokenMeja as string;
    const [menus, setMenus] = useState<Menu[]>([]);
    const [mejaData, setMejaData] = useState<{ nomorMeja: string; statusMeja: string } | null>(null);
    const [kategoris, setKategoris] = useState<{ id: number; nama: string; lokasi: "resto" | "cafe"; icon?: string | null }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [keranjang, setKeranjang] = useState<KeranjangItem[]>([]);
    const [showToastBerhasil, setShowToastBerhasil] = useState(false);
    const [menuHabisTerhapus, setMenuHabisTerhapus] = useState<string[]>([]);
    const [activeKategori, setActiveKategori] = useState("Semua");
    const [activeTempat, setActiveTempat] = useState<"resto" | "cafe">("resto");
    const [searchQuery, setSearchQuery] = useState("");

    const [voucher, setVoucher] = useState<VoucherTerpakai | null>(null);
    const [vouchers, setVouchers] = useState<VoucherOpsi[]>([]);
    const [voucherNotice, setVoucherNotice] = useState<string | null>(null);

    const CATEGORY_ICON_MAP_CUSTOMER: Record<string, LucideIcon> = {
        Utensils,
        GlassWater,
        Coffee,
        Cookie,
        Pizza,
        Hamburger,
        Sandwich,
        Carrot,
        Drumstick,
        Fish,
        Shrimp,
        Soup,
        Wheat,
        Salad,
        IceCream,
        CakeSlice,
        Popcorn,
        CupSoda,
        Package,
        Boxes,
        ChefHat,
    };

    const getKategoriIcon = (nama: string, iconKey?: string | null) => {
        if (iconKey && CATEGORY_ICON_MAP_CUSTOMER[iconKey]) return CATEGORY_ICON_MAP_CUSTOMER[iconKey];
        const n = nama.toLowerCase();
        if (n.includes("minum") || n.includes("drink") || n.includes("jus") || n.includes("teh") || n.includes("soda")) return GlassWater;
        if (n.includes("kopi") || n.includes("coffee")) return Coffee;
        if (n.includes("camilan") || n.includes("snack") || n.includes("goreng") || n.includes("kentang") || n.includes("kue") || n.includes("dessert") || n.includes("es krim")) return Cookie;
        if (n.includes("paket") || n.includes("set") || n.includes("bundle")) return Package;
        if (n.includes("makan")) return Utensils;
        return Utensils;
    };

    const [itemsToShow, setItemsToShow] = useState(12);
    const [showScanner, setShowScanner] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [manualTokenLoading, setManualTokenLoading] = useState(false);
    const [manualTokenError, setManualTokenError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [scanResultError, setScanResultError] = useState<string | null>(null);
    const [mejaTerpakaiWarning, setMejaTerpakaiWarning] = useState(false);
    const [adaPesananAktif, setAdaPesananAktif] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerRef = useRef<{ stream?: MediaStream }>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [data, statusAktif, voucherAktif] = await Promise.all([
                    getCustomerMenuData(tokenMeja),
                    getStatusPesananAktifMeja(tokenMeja),
                    getVoucherAktif(),
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
                setAdaPesananAktif(statusAktif?.adaPesananAktif ?? false);
                // Hanya tampilkan peringatan "meja terpakai" jika customer
                // TIDAK punya pesanan aktif di meja ini (artinya meja dipakai orang lain).
                if (data.meja.statusMeja === 'terpakai' && !statusAktif?.adaPesananAktif) {
                    setMejaTerpakaiWarning(true);
                }
                setMejaData(data.meja);

                setMenus(data.menus);
                setVouchers(voucherAktif);
                // Semua kategori (resto + cafe) disimpan. Pill kategori
                // untuk tab aktif dihitung ulang saat tab berubah, supaya
                // kategori cafe (mis. "Paket Ramadhan") ikut terlihat.
                setKategoris(
                    data.kategoris.map((kat) => ({
                        id: kat.id,
                        nama: kat.namaKategori,
                        lokasi: kat.lokasi,
                        icon: kat.icon ?? null,
                    })),
                );
                setLoading(false);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
                setLoading(false);
            }
        };
        loadData();
    }, [tokenMeja]);

    // Pill kategori untuk tab aktif (resto/cafe) + opsi "Semua"
    const kategoriPill = useMemo(() => {
        const list = kategoris.filter((kat) => kat.lokasi === activeTempat);
        return [{ id: 0, nama: "Semua", lokasi: activeTempat, icon: null }, ...list];
    }, [kategoris, activeTempat]);

    // Nama kategori di DB bisa lowercase (mis. "paket ramadhan"),
    // ditampilkan dengan huruf awal kapital.
    const formatKategoriNama = (nama: string) =>
        nama
            .split(" ")
            .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
            .join(" ");

    const filteredMenu = menus.filter((menu) => {
        const matchTempat =
            activeTempat === "cafe" ? menu.lokasi === "cafe" : menu.lokasi !== "cafe";
        const matchKategori =
            activeKategori === "Semua" ? true : menu.kategori === activeKategori;
        const matchSearch = menu.namaMenu.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTempat && matchKategori && matchSearch;
    });

    const displayedMenu = filteredMenu.slice(0, itemsToShow);
    const hasMore = filteredMenu.length > itemsToShow;

    const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
    const subtotal = keranjang.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

    // Validasi voucher: dipakai hanya jika subtotal >= minimal belanja.
    const effectiveVoucher = voucher && subtotal >= voucher.minimalBelanja ? voucher : null;
    const potonganVoucher = effectiveVoucher
        ? hitungPotonganDiskon(subtotal, effectiveVoucher.diskonPersen)
        : 0;
    const totalHarga = subtotal - potonganVoucher;

    const handlePilihVoucher = (v: VoucherOpsi) => {
        if (subtotal < v.minimalBelanja) {
            setVoucherNotice(
                `Minimal belanja voucher ${v.kode} adalah Rp ${v.minimalBelanja.toLocaleString("id-ID")}`,
            );
        } else {
            setVoucher({
                kode: v.kode,
                namaVoucher: v.namaVoucher,
                diskonPersen: v.diskonPersen,
                minimalBelanja: v.minimalBelanja,
            });
            setVoucherNotice(`Voucher ${v.kode} diterapkan`);
        }
        setTimeout(() => setVoucherNotice(null), 4000);
    };

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
            simpanKodeVoucher(effectiveVoucher?.kode ?? null);
            router.push(`/${tokenMeja}/checkout`);
        } catch {
            // Jika validasi daring gagal, tetap lanjut — createPesanan tetap
            // jadi gerbang terakhir di server.
            simpanKeranjangCheckout(keranjang);
            simpanKodeVoucher(effectiveVoucher?.kode ?? null);
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
                     <div className="flex items-center gap-2">
                         {adaPesananAktif && (
                             <PindahMejaSheet
                                 tokenMejaSaatIni={tokenMeja}
                                 nomorMejaSaatIni={mejaData?.nomorMeja || tokenMeja}
                                 onPindah={(tokenBaru, nomorBaru) => {
                                     setMejaData({ nomorMeja: nomorBaru, statusMeja: 'terpakai' });
                                     setMejaTerpakaiWarning(false);
                                     window.location.href = `/${tokenBaru}`;
                                 }}
                             >
                                 <Button variant="outline" size="sm" className="rounded-full">
                                     <ArrowRightLeft className="size-4 mr-1.5" />
                                     Pindah
                                 </Button>
                             </PindahMejaSheet>
                         )}
                         <CartSheet
                              keranjang={keranjang}
                              onUpdateJumlah={updateJumlah}
                              onHapus={hapusDariKeranjang}
                              onCheckout={handleCheckout}
                              subtotal={subtotal}
                             totalHarga={totalHarga}
                             voucher={effectiveVoucher}
                             onApplyVoucher={setVoucher}
                             vouchers={vouchers}
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
                     </div>
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
                                {/* Tab tempat: Resto | Cafe */}
                                <div className="flex gap-2 mb-4">
                                    <Button
                                        variant={activeTempat === "resto" ? "default" : "outline"}
                                        size="sm"
                                        className="rounded-full px-5"
                                        onClick={() => {
                                            setActiveTempat("resto");
                                            setActiveKategori("Semua");
                                            setItemsToShow(12);
                                        }}
                                    >
                                        <Utensils className="size-3.5 mr-1.5" />
                                        Resto
                                    </Button>
                                    <Button
                                        variant={activeTempat === "cafe" ? "default" : "outline"}
                                        size="sm"
                                        className={`rounded-full px-5 ${
                                            activeTempat === "cafe"
                                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                                : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                        }`}
                                        onClick={() => {
                                            setActiveTempat("cafe");
                                            setActiveKategori("Semua");
                                            setItemsToShow(12);
                                        }}
                                    >
                                        <Coffee className="size-3.5 mr-1.5" />
                                        Cafe
                                    </Button>
                                </div>

                                {activeTempat === "cafe" && (
                                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Coffee className="size-5 text-amber-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-amber-900">Pringmoni Cafe</p>
                                            <p className="text-xs text-amber-700">Menu khusus cafe — pesan langsung ke meja.</p>
                                        </div>
                                    </div>
                                )}
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

                        {/* Voucher (PBI-10.4) */}
                        {vouchers.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Ticket className="size-4 text-primary" />
                                    <p className="text-sm font-semibold">Voucher</p>
                                    <span className="text-xs text-muted-foreground">
                                        Min. pembelian Rp{" "}
                                        {Math.min(...vouchers.map((v) => v.minimalBelanja)).toLocaleString("id-ID")}
                                    </span>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {vouchers.map((v) => (
                                        <Button
                                            key={v.kode}
                                            variant={effectiveVoucher?.kode === v.kode ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-full px-4 shrink-0"
                                            onClick={() => handlePilihVoucher(v)}
                                        >
                                            <Tag className="size-3.5 mr-1.5" />
                                            {v.kode} · {v.diskonPersen}%
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Kategori - Pill buttons (sesuai tab aktif: Resto / Cafe) */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                            {kategoriPill.map((kat) => {
                                const Icon = kat.nama === "Semua" ? null : getKategoriIcon(kat.nama, kat.icon);
                                const aktif = activeKategori === kat.nama;
                                return (
                                    <Button
                                        key={kat.id}
                                        variant={aktif ? "default" : "outline"}
                                        size="sm"
                                        className={`rounded-full px-4 shrink-0 ${
                                            aktif && activeTempat === "cafe"
                                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setActiveKategori(kat.nama);
                                            setItemsToShow(12);
                                        }}
                                    >
                                        {Icon && <Icon className="size-3.5 mr-1.5" />}
                                        {formatKategoriNama(kat.nama)}
                                    </Button>
                                );
                            })}
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
                                     <ChevronDown className="size-4 mr-2" />
                                     Tampilkan Lainnya ({filteredMenu.length - itemsToShow} menu)
                                 </Button>
                            </div>
                        )}

                        {filteredMenu.length === 0 && (
                            <Card className="py-12">
                                <CardContent className="text-center text-muted-foreground">
                                    <p>
                                        {activeKategori !== "Semua"
                                            ? `Belum ada menu di kategori ${formatKategoriNama(activeKategori)}`
                                            : "Menu tidak ditemukan"}
                                    </p>
                                    {activeTempat === "cafe" && (
                                        <Button
                                            variant="ghost"
                                            className="mt-3 rounded-full"
                                            onClick={() => {
                                                setActiveTempat("resto");
                                                setActiveKategori("Semua");
                                                setItemsToShow(12);
                                            }}
                                        >
                                            <ArrowLeft className="size-4 mr-2" />
                                            Lihat Menu Resto
                                        </Button>
                                    )}
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
                                {totalItem} item{effectiveVoucher && <span className="text-green-600"> + Voucher</span>}
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

            {/* Toast Voucher */}
            {voucherNotice && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-primary text-primary-foreground shadow-lg py-2 px-3 rounded-full">
                        <CardContent className="flex items-center gap-2 p-0">
                            <span className="text-xs">{voucherNotice}</span>
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
