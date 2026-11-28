"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuCard } from "@/components/customer/menu-card";
import { CartSheet } from "@/components/customer/cart-sheet";
import { FloatingCartPanel } from "@/components/customer/floating-cart-panel";
import { PindahMejaSheet } from "@/components/customer/pindah-meja-sheet";
import { VoiceOrderSheet } from "@/components/customer/voice-order-sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ShoppingCart, ShoppingBag, Camera, X, AlertTriangle, Coffee, Utensils, ChevronDown, ArrowLeft, ArrowRightLeft, ClipboardList, Mic } from "lucide-react";
import { getKategoriIcon } from "@/lib/kategori-icon";
import { getCustomerMenuData, getMejaByToken, getStatusPesananAktifMeja } from "@/app/actions/pesanan";
import { getVoucherAktif } from "@/app/actions/voucher";
import { simpanKeranjangCheckout, simpanKodeVoucher, ambilKeranjangCheckout } from "@/lib/checkout-storage";
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

    const [itemsToShow, setItemsToShow] = useState(12);
    const [showScanner, setShowScanner] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [manualTokenLoading, setManualTokenLoading] = useState(false);
    const [manualTokenError, setManualTokenError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [scanResultError, setScanResultError] = useState<string | null>(null);
    const [mejaTerpakaiWarning, setMejaTerpakaiWarning] = useState(false);
    const [adaPesananAktif, setAdaPesananAktif] = useState(false);
    const [targetNavigasi, setTargetNavigasi] = useState<string | null>(null);
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
                // Peringatan hanya muncul jika meja benar-benar punya pesanan aktif.
                setMejaTerpakaiWarning(
                    data.meja.statusMeja === 'terpakai' && Boolean(statusAktif?.adaPesananAktif),
                );
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

    // Pulihkan keranjang dari checkout yang belum selesai agar tidak hilang
    // saat customer kembali dari halaman checkout.
    useEffect(() => {
        const saved = ambilKeranjangCheckout();
        if (saved && saved.length > 0) {
            setKeranjang(saved);
        }
    }, []);

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
    const menuUnikKeranjang = Array.from(new Map(keranjang.map((item) => [item.id, item])).values());
    const subtotal = keranjang.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

    // Validasi voucher: dipakai hanya jika subtotal >= minimal belanja.
    const effectiveVoucher = voucher && subtotal >= voucher.minimalBelanja ? voucher : null;
    const potonganVoucher = effectiveVoucher
        ? hitungPotonganDiskon(subtotal, effectiveVoucher.diskonPersen)
        : 0;
    const totalHarga = subtotal - potonganVoucher;

    const tambahKeranjang = (
        menu: Menu,
        jumlah: number = 1,
        catatan: string | null = null,
        varian: string | null = null,
    ) => {
        // Jaring pengaman: menu habis / resep belum lengkap / porsi habis
        // tidak boleh masuk keranjang, meski data di dialog sudah basi.
        if (menu.statusMenu !== "tersedia") return;
        if (!menu.resepLengkap) return;
        if ((menu.porsiTersedia ?? 0) <= 0) return;
        setKeranjang((prev) => {
            // Total porsi menu ini yang sudah ada di keranjang (semua catatan),
            // supaya tidak melebihi sisa porsi meski dipecah jadi beberapa catatan.
            const terpakai = prev
                .filter((item) => item.id === menu.id)
                .reduce((sum, item) => sum + item.jumlah, 0);
            const maksTambah = Math.max(1, (menu.porsiTersedia ?? 0) - terpakai);
            const jumlahFinal = Math.min(jumlah, maksTambah);

            // Cek jika ada item dengan menu, catatan, dan varian suhu yang sama
            const existing = prev.find(
                (item) => item.id === menu.id && item.catatan === catatan && item.varian === varian,
            );
            if (existing) {
                return prev.map((item) =>
                    item === existing ? { ...item, jumlah: item.jumlah + jumlahFinal } : item,
                );
            }
            return [...prev, { ...menu, jumlah: jumlahFinal, catatan, varian } as KeranjangItem];
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
                // Stok harian tetap berlaku walau angkanya tidak ditampilkan.
                const maks = Math.max(1, item.porsiTersedia ?? 1);
                return { ...item, jumlah: Math.min(jumlah, maks) };
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
                    porsi <= 0;

                if (habis) {
                    dihapus.push(item.namaMenu);
                    continue;
                }

                const maks = Math.max(1, porsi);
                const jumlahBaru = Math.min(item.jumlah, maks);
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
                navigasiDenganKonfirmasi(`/${token}`);
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
                navigasiDenganKonfirmasi(`/${token.trim()}`);
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

    const navigasiDenganKonfirmasi = (tujuan: string) => {
        if (keranjang.length > 0) {
            setTargetNavigasi(tujuan);
            return;
        }
        window.location.href = tujuan;
    };

    const propsKeranjang = {
        keranjang,
        onUpdateJumlah: updateJumlah,
        onHapus: hapusDariKeranjang,
        onCheckout: handleCheckout,
        subtotal,
        totalHarga,
        voucher: effectiveVoucher,
        onApplyVoucher: setVoucher,
        vouchers,
    };

 return (
        <div className="bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4 md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary font-heading text-sm font-bold text-primary-foreground sm:size-9">
                            P
                        </span>
                        <div className="flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                            <h1 className="font-heading text-lg font-bold leading-none sm:text-xl">Pringmoni</h1>
                            {!error && !loading && (
                                <Badge
                                    variant="outline"
                                    className="max-w-[10rem] truncate rounded-full border-primary/20 bg-primary/5 px-2 py-0 text-[10px] text-primary sm:max-w-none sm:text-xs"
                                >
                                    Meja {mejaData?.nomorMeja || tokenMeja}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {!loading && !error && (
                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                            {adaPesananAktif && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        aria-label="Lihat pesanan"
                                        className="rounded-full px-2.5 sm:px-4"
                                        onClick={() => router.push(`/${tokenMeja}/pesanan`)}
                                    >
                                        <ClipboardList className="size-4" />
                                        <span className="hidden text-xs sm:inline">Pesanan</span>
                                    </Button>
                                    <PindahMejaSheet
                                        tokenMejaSaatIni={tokenMeja}
                                        nomorMejaSaatIni={mejaData?.nomorMeja || tokenMeja}
                                        onPindah={(tokenBaru, nomorBaru) => {
                                            setMejaData({ nomorMeja: nomorBaru, statusMeja: 'terpakai' });
                                            setMejaTerpakaiWarning(false);
                                            navigasiDenganKonfirmasi(`/${tokenBaru}`);
                                        }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            aria-label="Pindah meja"
                                            className="rounded-full px-2.5 sm:px-4"
                                        >
                                            <ArrowRightLeft className="size-4" />
                                            <span className="hidden text-xs sm:inline">Pindah</span>
                                        </Button>
                                    </PindahMejaSheet>
                                </>
                            )}
                            <CartSheet {...propsKeranjang}>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Buka keranjang"
                                    className="relative size-9 rounded-full sm:size-10"
                                >
                                    <ShoppingCart className="size-4 sm:size-5" />
                                    {totalItem > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground sm:h-5 sm:min-w-5 sm:text-xs">
                                            {totalItem}
                                        </span>
                                    )}
                                </Button>
                            </CartSheet>
                        </div>
                    )}
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-2xl gap-6 px-4 pb-32 pt-6 md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
            <main className="min-w-0 flex-1">
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
                                <div className="sticky top-14 z-40 -mx-4 px-3 pb-1.5 sm:top-16 sm:px-4 sm:pb-2">
                                    <div className="rounded-xl border border-border/70 bg-card/95 p-1.5 shadow-md backdrop-blur sm:rounded-2xl sm:p-2.5">
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground sm:left-3.5 sm:size-4" />
                                            <Input
                                                type="search"
                                                placeholder="Cari menu..."
                                                className="h-9 rounded-full bg-muted/60 pl-9 pr-12 text-xs sm:h-10 sm:pl-10 sm:pr-14 sm:text-sm"
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setItemsToShow(12);
                                                }}
                                            />
                                            <VoiceOrderSheet
                                                tokenMeja={tokenMeja}
                                                menus={menus}
                                                onTambah={(menu) => tambahKeranjang(menu, 1)}
                                            >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="absolute right-0.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-primary/25 bg-primary/10 text-primary shadow-sm hover:bg-primary/15 sm:right-1 sm:size-9"
                                                    aria-label="Pesan pakai mic, pemakaian dibatasi"
                                                    title="Pesan pakai mic — pemakaian dibatasi"
                                                >
                                                    <Mic className="size-4 sm:size-[18px]" />
                                                </Button>
                                            </VoiceOrderSheet>
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-2 sm:gap-2">
                                            <div
                                                role="tablist"
                                                aria-label="Pilih lokasi menu"
                                                className="flex shrink-0 gap-1.5 rounded-full border border-border/60 bg-muted/60 p-0.5 sm:gap-2 sm:p-1"
                                            >
                                                <Button
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={activeTempat === "resto"}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-7 shrink-0 rounded-full px-2.5 text-[11px] sm:h-8 sm:px-3 sm:text-xs ${
                                                        activeTempat === "resto"
                                                            ? "bg-background text-foreground shadow-sm hover:bg-background"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                                    onClick={() => {
                                                        setActiveTempat("resto");
                                                        setActiveKategori("Semua");
                                                        setItemsToShow(12);
                                                    }}
                                                >
                                                    <Utensils className="mr-1 size-3 sm:mr-1.5 sm:size-3.5" />
                                                    Resto
                                                </Button>
                                                <Button
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={activeTempat === "cafe"}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-7 shrink-0 rounded-full px-2.5 text-[11px] sm:h-8 sm:px-3 sm:text-xs ${
                                                        activeTempat === "cafe"
                                                            ? "bg-amber-600 text-white shadow-sm hover:bg-amber-700 hover:text-white"
                                                            : "text-amber-800 hover:text-amber-900"
                                                    }`}
                                                    onClick={() => {
                                                        setActiveTempat("cafe");
                                                        setActiveKategori("Semua");
                                                        setItemsToShow(12);
                                                    }}
                                                >
                                                    <Coffee className="mr-1 size-3 sm:mr-1.5 sm:size-3.5" />
                                                    Cafe
                                                </Button>
                                            </div>
                                            <span
                                                aria-hidden="true"
                                                className="mx-0.5 h-5 w-px shrink-0 bg-border sm:mx-1 sm:h-6"
                                            />
                                            <div className="flex shrink-0 gap-1.5 sm:gap-2">
                                                {kategoriPill.map((kat) => {
                                                    const Icon =
                                                        kat.nama === "Semua" ? null : getKategoriIcon(kat.nama, kat.icon);
                                                    const aktif = activeKategori === kat.nama;
                                                    return (
                                                        <Button
                                                            key={kat.id}
                                                            variant={aktif ? "default" : "outline"}
                                                            size="sm"
                                                            className={`h-7 shrink-0 rounded-full px-3 text-[11px] sm:h-8 sm:px-4 sm:text-xs ${
                                                                aktif && activeTempat === "cafe"
                                                                    ? "border-amber-600 bg-amber-600 text-white hover:bg-amber-700 hover:text-white"
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                setActiveKategori(kat.nama);
                                                                setItemsToShow(12);
                                                            }}
                                                        >
                                                            {Icon && <Icon className="mr-1 size-3 sm:mr-1.5 sm:size-3.5" />}
                                                            {formatKategoriNama(kat.nama)}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
                                        {searchQuery
                                            ? `Menu untuk "${searchQuery}" tidak ditemukan`
                                            : activeKategori !== "Semua"
                                              ? `Belum ada menu di kategori ${formatKategoriNama(activeKategori)}`
                                              : "Menu tidak ditemukan"}
                                    </p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        {(searchQuery || activeKategori !== "Semua") && (
                                            <Button
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setActiveKategori("Semua");
                                                    setItemsToShow(12);
                                                }}
                                            >
                                                Hapus filter
                                            </Button>
                                        )}
                                        {activeTempat === "cafe" && (
                                            <Button
                                                variant="ghost"
                                                className="rounded-full"
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
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>

            {!loading && !error && <FloatingCartPanel {...propsKeranjang} />}
            </div>

            {!loading && !error && (
                <div className="fixed inset-x-0 bottom-[calc(3.75rem_+_env(safe-area-inset-bottom))] z-40 px-3 xl:hidden">
                    <CartSheet {...propsKeranjang} side="right">
                        <button
                            type="button"
                            aria-label="Buka keranjang"
                            className="mx-auto flex h-12 w-full max-w-sm items-center gap-2 rounded-full border bg-background/95 px-3 text-left shadow-lg backdrop-blur sm:max-w-md"
                        >
                            <span className="flex shrink-0 items-center overflow-hidden pl-0.5">
                                {menuUnikKeranjang.length > 0 ? (
                                    <>
                                        {menuUnikKeranjang.slice(0, 3).map((item, index) => {
                                            const foto = menus.find((menu) => menu.id === item.id)?.fotoUrl;
                                            return (
                                                <span
                                                    key={item.id}
                                                    className={`-ml-2 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-semibold ring-2 ring-background first:ml-0 ${
                                                        index === 2 && menuUnikKeranjang.length > 3 ? "z-0" : "z-10"
                                                    }`}
                                                >
                                                    {foto ? (
                                                        <Image
                                                            src={foto}
                                                            alt=""
                                                            width={32}
                                                            height={32}
                                                            className="size-8 object-cover"
                                                        />
                                                    ) : (
                                                        item.namaMenu.charAt(0).toUpperCase()
                                                    )}
                                                </span>
                                            );
                                        })}
                                        {menuUnikKeranjang.length > 3 && (
                                            <span className="-ml-2 z-20 flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background ring-2 ring-background">
                                                +{menuUnikKeranjang.length - 3}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                                        <ShoppingBag className="size-4 text-muted-foreground" />
                                    </span>
                                )}
                            </span>
                            <span className="min-w-0 flex-1 px-0.5 text-left">
                                {totalItem > 0 ? (
                                    <>
                                        <span className="block truncate text-xs font-semibold">
                                            {totalItem} item · Rp {totalHarga.toLocaleString("id-ID")}
                                        </span>
                                        <span className="block truncate text-[10px] text-muted-foreground">
                                            Ketuk untuk lihat keranjang
                                        </span>
                                    </>
                                ) : (
                                    <span className="block truncate text-xs text-muted-foreground">
                                        Belum ada menu dipilih
                                    </span>
                                )}
                            </span>
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <ShoppingCart className="size-4" />
                            </span>
                        </button>
                    </CartSheet>
                </div>
            )}

            {/* Toast Menu Ditambahkan */}
            {showToastBerhasil && (
                <div className="fixed bottom-[calc(7.25rem_+_env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="bg-primary text-primary-foreground shadow-lg py-2 px-3 rounded-full">
                        <CardContent className="flex items-center gap-2 p-0">
                            <span className="text-xs">Menu ditambahkan</span>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Toast Menu Habis Dihapus dari Keranjang */}
            {menuHabisTerhapus.length > 0 && (
                <div className="fixed bottom-[calc(7.25rem_+_env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2">
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

            <Dialog
                open={targetNavigasi !== null}
                onOpenChange={(buka) => {
                    if (!buka) setTargetNavigasi(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Keranjang belum diselesaikan</DialogTitle>
                        <DialogDescription>
                            Anda masih punya {totalItem} item di keranjang. Pesanan ini belum dikirim. Tetap di meja ini
                            atau lanjutkan dan keranjang akan hilang?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTargetNavigasi(null)}>
                            Tetap di sini
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                const tujuan = targetNavigasi;
                                setTargetNavigasi(null);
                                if (tujuan) window.location.href = tujuan;
                            }}
                        >
                            Tinggalkan keranjang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
