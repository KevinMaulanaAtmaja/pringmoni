"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2, Armchair, Sofa } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getMejaTersediaPindah, pindahMeja } from "@/app/actions/pesanan";
import type { MejaTersediaPindah } from "@/app/actions/pesanan";

interface PindahMejaSheetProps {
  tokenMejaSaatIni: string;
  nomorMejaSaatIni: string;
  onPindah: (tokenBaru: string, nomorBaru: string) => void;
  children: React.ReactNode;
}

export function PindahMejaSheet({
  tokenMejaSaatIni,
  nomorMejaSaatIni,
  onPindah,
  children,
}: PindahMejaSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daftar, setDaftar] = useState<MejaTersediaPindah[]>([]);
  const [selected, setSelected] = useState<MejaTersediaPindah | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelected(null);
      setProcessError(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await getMejaTersediaPindah(tokenMejaSaatIni);
    if ("error" in result) {
      setError(result.error);
      setDaftar([]);
    } else {
      setDaftar(result.daftar);
    }
    setLoading(false);
  }

  async function handlePindah() {
    if (!selected) return;
    setProcessing(true);
    setProcessError(null);
    const result = await pindahMeja(tokenMejaSaatIni, selected.tokenMeja);
    if ("error" in result) {
      setProcessError(result.error);
      setProcessing(false);
      return;
    }
    setOpen(false);
    onPindah(result.tokenMejaBaru, result.nomorMejaBaru);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex max-h-[60vh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
      >
        {/* Drag handle ala bottom sheet */}
        <div className="flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="flex items-center justify-center gap-2 font-heading text-base">
            <ArrowRightLeft className="size-4 text-primary" />
            Pindah Meja
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Meja saat ini */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/50 px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Armchair className="size-4 text-primary" />
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Meja saat ini </span>
              <span className="font-semibold">{nomorMejaSaatIni}</span>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Memuat meja tersedia...</span>
            </div>
          )}

          {error && (
            <p className="py-2 text-center text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && daftar.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
              <Armchair className="mb-2 size-8 opacity-50" />
              <p className="text-sm">Tidak ada meja kosong saat ini</p>
            </div>
          )}

          {!loading && !error && daftar.length > 0 && (
            <>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Meja kosong tersedia
              </p>
              <div className="grid grid-cols-2 gap-2">
                {daftar.map((m) => {
                  const aktif = selected?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m)}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        aktif
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "bg-card hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`mx-auto flex size-9 items-center justify-center rounded-full ${
                          aktif
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.tipeMeja === "lesehan" ? (
                          <Sofa className="size-4" />
                        ) : (
                          <Armchair className="size-4" />
                        )}
                      </div>
                      <p className="mt-1.5 text-sm font-semibold">{m.nomorMeja}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.kapasitas} {m.tipeMeja === "lesehan" ? "lesehan" : "kursi"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {processError && (
            <p className="mt-3 text-center text-sm text-destructive">{processError}</p>
          )}
        </div>

        {/* Footer: button tetap di bawah, tidak ikut scroll */}
        <div className="border-t bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <Button
            className="w-full rounded-full"
            disabled={!selected || processing}
            onClick={handlePindah}
          >
            {processing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Memindahkan...
              </>
            ) : selected ? (
              <>Pindah ke Meja {selected.nomorMeja}</>
            ) : (
              "Pilih meja tujuan"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
