"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Loader2, Mic, MicOff, Plus, Sparkles } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useAudioTranscribe } from "@/hooks/use-audio-transcribe"
import type { RekomendasiMenu, VoiceRecommendation } from "@/types"
import type { CustomerMenu } from "@/types"

interface VoiceOrderSheetProps {
    tokenMeja: string
    menus: CustomerMenu[]
    onTambah: (menu: CustomerMenu) => void
    children: React.ReactNode
}

function persen(nilai: number): string {
    return `${Math.round(nilai * 100)}%`
}

export function VoiceOrderSheet({
    tokenMeja,
    menus,
    onTambah,
    children,
}: VoiceOrderSheetProps) {
    const [open, setOpen] = useState(false)
    const [teksManual, setTeksManual] = useState("")
    const [hasil, setHasil] = useState<VoiceRecommendation | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pernahMendengar = useRef(false)
    const { transkrip, listening, menyiapkan, didukung, error: errorVoice, mulaiDengar, berhentiDengar, reset } = useVoiceInput()

    const ambilRekomendasi = useCallback(async (teks: string) => {
        const bersih = teks.trim()
        if (!bersih) {
            setError("Silakan ucapkan atau ketik permintaan Anda terlebih dahulu.")
            return
        }

        setLoading(true)
        setError(null)
        setHasil(null)

        try {
            const response = await fetch("/api/rekomendasi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transkrip: bersih, tokenMeja }),
            })
            const data = await response.json()

            if (!response.ok) {
                if (response.status === 429 && typeof data.retryAfterDetik === "number") {
                    setError(`Terlalu banyak permintaan. Coba lagi dalam ${data.retryAfterDetik} detik.`)
                } else {
                    setError(data.error ?? "Gagal mencari rekomendasi. Silakan coba lagi.")
                }
                return
            }

            setHasil(data as VoiceRecommendation)
        } catch {
            setError("Tidak dapat terhubung ke server. Silakan coba lagi.")
        } finally {
            setLoading(false)
        }
    }, [tokenMeja])

    const audio = useAudioTranscribe(tokenMeja, (teks) => {
        setTeksManual(teks)
        void ambilRekomendasi(teks)
    })
    const errorTampil = error || audio.error

    useEffect(() => {
        if (transkrip) {
            setTeksManual(transkrip)
        }
    }, [transkrip])

    useEffect(() => {
        if (pernahMendengar.current && !listening && transkrip.trim()) {
            void ambilRekomendasi(transkrip)
        }
        pernahMendengar.current = listening
    }, [listening, transkrip, ambilRekomendasi])

    useEffect(() => {
        if (errorVoice) {
            setError(errorVoice)
        }
    }, [errorVoice])

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen)
        if (!nextOpen) {
            reset()
            audio.reset()
            setTeksManual("")
            setHasil(null)
            setError(null)
            setLoading(false)
            pernahMendengar.current = false
        }
    }

    function handleMulaiDengar() {
        setError(null)
        setHasil(null)
        setTeksManual("")
        pernahMendengar.current = true
        mulaiDengar()
    }

    function handleBerhentiDengar() {
        berhentiDengar()
    }

    function handleTambah(item: RekomendasiMenu) {
        const menu = menus.find((m) => m.id === item.menuId)
        if (!menu) return
        onTambah(menu)
        setOpen(false)
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent
                side="bottom"
                className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
            >
                <div className="flex justify-center pt-2">
                    <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                </div>

                <SheetHeader className="border-b px-4 py-3">
                    <SheetTitle className="flex items-center justify-center gap-2 font-heading text-base">
                        <Mic className="size-4 text-primary" />
                        Pesan Pakai Suara
                    </SheetTitle>
                    <p className="mt-1 text-center text-[11px] text-muted-foreground">
                        Opsional · kuota rekomendasi AI terbatas
                    </p>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {!didukung && (
                        <div className="mb-4 flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <span>
                                {audio.didukung
                                    ? "Input suara langsung tidak didukung. Anda bisa rekam audio di bawah atau ketik manual."
                                    : "Browser ini tidak mendukung input suara. Silakan ketik permintaan Anda di bawah."}
                            </span>
                        </div>
                    )}

                    {hasil ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border bg-muted/40 px-4 py-4 text-center">
                            <p className="text-sm font-medium">Rekomendasi siap.</p>
                            <p className="text-xs text-muted-foreground">
                                Pilih menu di bawah atau tutup sheet. Buka lagi bila ingin mencari lain.
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="mt-1 rounded-full"
                                onClick={() => {
                                    pernahMendengar.current = false
                                    setHasil(null)
                                    setTeksManual("")
                                    reset()
                                }}
                            >
                                Cari lagi
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/40 px-4 py-5">
                            <button
                                type="button"
                                onClick={listening ? handleBerhentiDengar : handleMulaiDengar}
                                disabled={!didukung || loading || menyiapkan}
                                aria-label={menyiapkan ? "Menyiapkan model suara" : listening ? "Hentikan perekaman suara" : "Mulai bicara"}
                                className={`flex size-16 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                                    listening
                                        ? "bg-destructive text-destructive-foreground animate-pulse"
                                        : "bg-primary text-primary-foreground"
                                }`}
                            >
                                {menyiapkan ? <Loader2 className="size-7 animate-spin" /> : listening ? <MicOff className="size-7" /> : <Mic className="size-7" />}
                            </button>
                            <p className="text-sm font-medium">
                                {menyiapkan
                                    ? "Menyiapkan model suara..."
                                    : listening
                                        ? "Mendengarkan... Tekan untuk menghentikan"
                                        : "Tekan dan ceritakan yang Anda inginkan"}
                            </p>
                            <p className="text-center text-xs text-muted-foreground">
                                Contoh: &ldquo;Aduh panas, enaknya yang seger&rdquo;
                            </p>
                            <p className="text-center text-[11px] text-muted-foreground">
                                Rekomendasi AI dibatasi 10x per 10 menit. Satu kali bicara cukup untuk satu permintaan.
                            </p>
                        </div>
                    )}

                    {(!didukung || Boolean(errorVoice)) && audio.didukung && (
                        <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-dashed px-3 py-3">
                            <p className="text-center text-xs text-muted-foreground">
                                Rekam audio lalu unggah (cadangan untuk Firefox, Zen, dan iOS)
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={audio.loading || loading}
                                onClick={() => audio.recording ? audio.berhentiRekam() : void audio.mulaiRekam()}
                            >
                                {audio.loading ? <Loader2 className="size-4 animate-spin" /> : audio.recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                                <span className="ml-1.5">
                                    {audio.loading
                                        ? "Mengenali suara..."
                                        : audio.recording
                                            ? "Hentikan Rekaman"
                                            : "Rekam Audio"}
                                </span>
                            </Button>
                        </div>
                    )}

                    <div className="mt-4">
                        <label htmlFor="voice-transkrip" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Atau ketik manual
                        </label>
                        <textarea
                            id="voice-transkrip"
                            value={teksManual}
                            maxLength={500}
                            rows={2}
                            onChange={(event) => setTeksManual(event.target.value)}
                            placeholder="Contoh: saya capek, mau yang manis"
                            className="w-full resize-none rounded-xl border bg-muted/50 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">{teksManual.length}/500</span>
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-full"
                                onClick={() => void ambilRekomendasi(teksManual)}
                                disabled={loading || !teksManual.trim() || Boolean(hasil)}
                            >
                                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                                <span className="ml-1.5">Lihat Rekomendasi</span>
                            </Button>
                        </div>
                    </div>

                    {errorTampil && (
                        <div className="mt-4 flex gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <span>{errorTampil}</span>
                        </div>
                    )}

                    {hasil && (
                        <div className="mt-5 space-y-3">
                            <div className="rounded-xl border bg-primary/5 px-3 py-2.5">
                                <p className="text-sm font-semibold">Mood: {hasil.mood}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{hasil.alasan}</p>
                            </div>

                            <p className="text-xs font-medium text-muted-foreground">Rekomendasi untuk Anda</p>

                            {hasil.rekomendasi.length === 0 && (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    Belum ada menu yang cocok saat ini.
                                </p>
                            )}

                            {hasil.rekomendasi.map((item) => {
                                const menu = menus.find((m) => m.id === item.menuId)
                                if (!menu) return null
                                const habis = menu.statusMenu !== "tersedia" || (menu.adaResep && (menu.porsiTersedia ?? 0) <= 0)
                                return (
                                    <div key={item.menuId} className="rounded-xl border px-3 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{menu.namaMenu}</p>
                                                <p className="text-xs text-muted-foreground">{menu.kategori}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold text-primary">{persen(item.skor)}</p>
                                                <p className="text-[10px] text-muted-foreground">skor cocok</p>
                                            </div>
                                        </div>

                                        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-lg bg-muted/60 py-1.5">
                                                <p className="text-[10px] text-muted-foreground">CBF</p>
                                                <p className="text-xs font-medium">{persen(item.rincian.cbf)}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/60 py-1.5">
                                                <p className="text-[10px] text-muted-foreground">CF</p>
                                                <p className="text-xs font-medium">{persen(item.rincian.cf)}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/60 py-1.5">
                                                <p className="text-[10px] text-muted-foreground">Stok</p>
                                                <p className="text-xs font-medium">{persen(item.rincian.stok)}</p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            className="mt-3 w-full rounded-full"
                                            onClick={() => handleTambah(item)}
                                            disabled={habis}
                                        >
                                            <Plus className="size-4" />
                                            <span className="ml-1.5">{habis ? "Menu Habis" : "Tambah ke Keranjang"}</span>
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
