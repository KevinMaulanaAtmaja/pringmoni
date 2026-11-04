"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2, Users, Armchair, Sofa } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5" />
            Pindah Meja
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-4 overflow-y-auto">
          {/* Info meja saat ini */}
          <div className="rounded-lg border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Meja saat ini</p>
            <p className="font-semibold">{nomorMejaSaatIni}</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Memuat meja tersedia...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center py-4">{error}</p>
          )}

          {!loading && !error && daftar.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada meja kosong saat ini
            </p>
          )}

          {!loading && !error && daftar.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {daftar.map((m) => {
                const aktif = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelected(m)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      aktif
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{m.nomorMeja}</span>
                      {m.tipeMeja === "lesehan" ? (
                        <Sofa className="size-4 text-muted-foreground" />
                      ) : (
                        <Armchair className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Users className="size-3" />
                      {m.kapasitas} orang
                    </div>
                    <Badge variant="outline" className="mt-1.5 text-[10px]">
                      {m.tipeMeja === "lesehan" ? "Lesehan" : "Kursi"}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {processError && (
            <p className="text-sm text-destructive text-center">{processError}</p>
          )}

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
