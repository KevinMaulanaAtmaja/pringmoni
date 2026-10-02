'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CookingPot, Plus, Save, Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  getBahanDapurList,
  getResepMenu,
  saveResepMenu,
  StokBahanWithType,
} from '@/app/actions/stok-bahan';
import { butuhBumbu } from '@/lib/resep';

const kategoriLabels: Record<string, string> = {
  bahan_utama: 'Bahan Utama',
  bumbu: 'Bumbu',
};

const satuanLabels: Record<string, string> = {
  kg: 'kg',
  pcs: 'pcs',
  pack: 'pack',
  bungkus: 'bungkus',
};

function normalisasiKategori(kategori: string): KategoriResep {
  return kategori === 'bumbu' ? 'bumbu' : 'bahan_utama';
}

type ResepRow = {
  key: string;
  kategori: KategoriResep;
  stokBahanId: number | null;
  jumlah: string;
};

type KategoriResep = 'bahan_utama' | 'bumbu';

let rowCounter = 0;
function newRow(
  kategori: KategoriResep,
  stokBahanId: number | null = null,
  jumlah = ''
): ResepRow {
  rowCounter += 1;
  return { key: `row-${rowCounter}`, kategori, stokBahanId, jumlah };
}

const RESEP_KATEGORI: KategoriResep[] = ['bahan_utama', 'bumbu'];

type ResepMenuDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId: number | null;
  namaMenu: string;
  kategoriMenu?: string;
  onSaved?: () => void;
};

export function ResepMenuDialog({
  open,
  onOpenChange,
  menuId,
  namaMenu,
  kategoriMenu,
  onSaved,
}: ResepMenuDialogProps) {
  const [bahanList, setBahanList] = useState<StokBahanWithType[]>([]);
  const [rows, setRows] = useState<ResepRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open || !menuId) return;

    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      setWarning(null);
      setSaved(false);
      try {
        const [bahan, resep] = await Promise.all([
          getBahanDapurList(),
          getResepMenu(menuId),
        ]);
        if (!active) return;
        setBahanList(bahan);

        if (resep && resep.items.length > 0) {
          const kategoriById = new Map(
            bahan.map((b) => [b.id, normalisasiKategori(b.kategori)])
          );
          const loaded = resep.items.map((i) =>
            newRow(
              kategoriById.get(i.stokBahanId) ?? 'bahan_utama',
              i.stokBahanId,
              String(i.jumlah)
            )
          );
          // Pastikan kedua kategori punya minimal satu baris kosong
          const hasil = [...loaded];
          for (const k of RESEP_KATEGORI) {
            if (!hasil.some((r) => r.kategori === k)) {
              hasil.push(newRow(k));
            }
          }
          setRows(hasil);
        } else {
          setRows(RESEP_KATEGORI.map((k) => newRow(k)));
        }
      } catch {
        if (!active) return;
        setError('Gagal memuat data resep');
        setRows(RESEP_KATEGORI.map((k) => newRow(k)));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, menuId]);

  const bahanPerKategori = useMemo(() => {
    const groups: Record<KategoriResep, StokBahanWithType[]> = {
      bahan_utama: [],
      bumbu: [],
    };
    for (const b of bahanList) {
      groups[normalisasiKategori(b.kategori)].push(b);
    }
    return groups;
  }, [bahanList]);

  const rowsPerKategori = useMemo(
    () => ({
      bahan_utama: rows.filter((r) => r.kategori === 'bahan_utama'),
      bumbu: rows.filter((r) => r.kategori === 'bumbu'),
    }),
    [rows]
  );

  const selectedIds = useMemo(
    () =>
      rows
        .map((r) => r.stokBahanId)
        .filter((id): id is number => id !== null),
    [rows]
  );

  const bahanMap = useMemo(
    () => new Map(bahanList.map((b) => [b.id, b])),
    [bahanList]
  );

  const duplikat = useMemo(() => {
    const seen = new Set<number>();
    for (const id of selectedIds) {
      if (seen.has(id)) return true;
      seen.add(id);
    }
    return false;
  }, [selectedIds]);

  const belumPilihBahan = useMemo(
    () =>
      rows.some(
        (r) =>
          r.stokBahanId === null &&
          r.jumlah.trim() !== ''
      ),
    [rows]
  );

  // Bahan sudah dipilih tapi jumlah masih 0/kosong
  const jumlahTanpaBahan = useMemo(
    () =>
      rows.some(
        (r) =>
          r.stokBahanId !== null &&
          !(Number(r.jumlah) > 0)
      ),
    [rows]
  );

  const totalBiaya = useMemo(() => {
    let total = 0;
    for (const r of rows) {
      if (r.stokBahanId === null) continue;
      const bahan = bahanMap.get(r.stokBahanId);
      if (!bahan) continue;
      total += (Number(r.jumlah) || 0) * bahan.hargaPerSatuan;
    }
    return total;
  }, [rows, bahanMap]);

  const jumlahBahanTerpilih = useMemo(
    () =>
      new Set(
        rows
          .map((r) => r.stokBahanId)
          .filter((id): id is number => id !== null)
      ).size,
    [rows]
  );

  const terisiPerKategori = useMemo(() => {
    const hasil: Record<KategoriResep, number> = {
      bahan_utama: 0,
      bumbu: 0,
    };
    for (const r of rows) {
      if (r.stokBahanId === null) continue;
      if (!(Number(r.jumlah) > 0)) continue;
      hasil[r.kategori] += 1;
    }
    return hasil;
  }, [rows]);

  const wajibBumbu = butuhBumbu(kategoriMenu);

  const kurang: string[] = [];
  if (terisiPerKategori.bahan_utama === 0) kurang.push('1 bahan utama');
  if (wajibBumbu && terisiPerKategori.bumbu === 0) kurang.push('1 bahan bumbu');
  const tidakLengkap = kurang.length > 0 && jumlahBahanTerpilih > 0;

  function updateRow(key: string, patch: Partial<ResepRow>) {
    setSaved(false);
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  }

  function mutateRows(
    updater: (prev: ResepRow[]) => ResepRow[]
  ) {
    setSaved(false);
    setRows((prev) => updater(prev));
  }

  async function handleSave() {
    if (!menuId) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const items = rows
        .filter(
          (r) => r.stokBahanId !== null && Number(r.jumlah) > 0
        )
        .map((r) => ({
          stokBahanId: r.stokBahanId as number,
          jumlah: Number(r.jumlah),
        }));

      const result = await saveResepMenu(menuId, items);
      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      // Muat ulang supaya baris resep & angka stok dapet nilai terbaru.
      try {
        const [bahan, resep] = await Promise.all([
          getBahanDapurList(),
          getResepMenu(menuId),
        ]);
        setBahanList(bahan);
        if (resep && resep.items.length > 0) {
          const kategoriById = new Map(
            bahan.map((b) => [b.id, normalisasiKategori(b.kategori)])
          );
          const hasil = resep.items.map((i) =>
            newRow(
              kategoriById.get(i.stokBahanId) ?? 'bahan_utama',
              i.stokBahanId,
              String(i.jumlah)
            )
          );
          for (const k of RESEP_KATEGORI) {
            if (!hasil.some((r) => r.kategori === k)) {
              hasil.push(newRow(k));
            }
          }
          setRows(hasil);
        }
      } catch {
        // Gagal refresh tidak membatalkan penyimpanan.
      }
      onSaved?.();
    } catch {
      setError('Gagal menyimpan resep');
    } finally {
      setSaving(false);
    }
  }

  const belumAdaBahanDapur = !loading && bahanList.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-3xl overflow-hidden gap-4 grid grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <CookingPot className="w-4 h-4" />
            Resep {namaMenu}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Daftar bahan baku yang dipakai untuk 1 porsi. Stok bahan dapur
            otomatis berkurang tiap pesanan {namaMenu} selesai.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Memuat bahan dapur...
            </div>
          ) : belumAdaBahanDapur ? (
            <div className="py-8 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
              <p className="text-sm font-medium">
                Belum ada bahan dengan Lokasi Stok = Dapur
              </p>
              <p className="text-xs text-muted-foreground">
                Tambahkan bahan di halaman Stok Bahan dengan Lokasi Stok
                &quot;Dapur&quot; dulu, baru resep ini bisa diisi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {RESEP_KATEGORI.map((kategori) => {
              const daftarBahan = bahanPerKategori[kategori];
              const baris = rowsPerKategori[kategori];
              const terisi = baris.filter(
                (r) =>
                  r.stokBahanId !== null &&
                  Number(r.jumlah) > 0
              ).length;
              const lengkap = terisi > 0;

              return (
                <div
                  key={kategori}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-foreground">
                        {kategoriLabels[kategori]}
                      </h3>
                      {lengkap ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 border-emerald-300"
                        >
                          {terisi} bahan
                        </Badge>
                      ) : kategori === 'bumbu' && !wajibBumbu ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground"
                        >
                          Opsional
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-amber-700 border-amber-300"
                        >
                          Wajib minimal 1
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={daftarBahan.length === 0}
                      onClick={() =>
                        mutateRows((prev) => [
                          ...prev,
                          newRow(kategori),
                        ])
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah {kategoriLabels[kategori]}
                    </Button>
                  </div>

                  {daftarBahan.length === 0 ? (
                    <p className="text-xs text-amber-700 border border-amber-300 rounded-md px-3 py-2">
                      Belum ada bahan dapur dengan kategori{' '}
                      {kategoriLabels[kategori]}. Tambahkan
                      di halaman Stok Bahan lebih dulu.
                    </p>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="h-8 py-1 text-xs font-medium">
                              Bahan Baku
                            </TableHead>
                            <TableHead className="h-8 py-1 w-32 text-xs font-medium">
                              Jumlah / Porsi
                            </TableHead>
                            <TableHead className="h-8 py-1 w-24 text-right text-xs font-medium">
                              Stok Dapur
                            </TableHead>
                            <TableHead className="h-8 py-1 w-10 text-right text-xs font-medium">
                              <span className="sr-only">Aksi</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {baris.map((row) => {
                            const bahan =
                              row.stokBahanId !== null
                                ? bahanMap.get(row.stokBahanId)
                                : undefined;
                            const jumlah = Number(row.jumlah) || 0;
                            const kurang =
                              !!bahan &&
                              jumlah > bahan.stokQty;

                            return (
                              <TableRow key={row.key}>
                                <TableCell className="py-2">
                                  <Select
                                    value={
                                      row.stokBahanId !== null
                                        ? String(row.stokBahanId)
                                        : ''
                                    }
                                    onValueChange={(value) =>
                                      updateRow(row.key, {
                                        stokBahanId:
                                          Number(value),
                                        // Bahan sudah dipaketkan, jadi
                                        // jatah default-nya 1 paket per porsi.
                                        jumlah:
                                          row.jumlah.trim() === ''
                                            ? '1'
                                            : row.jumlah,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Pilih bahan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {daftarBahan.map((b) => (
                                        <SelectItem
                                          key={b.id}
                                          value={String(b.id)}
                                          disabled={selectedIds.includes(
                                            b.id
                                          )}
                                        >
                                          {b.namaBahan} (
                                          {satuanLabels[
                                            b.satuan
                                          ] ?? b.satuan})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>

                                <TableCell className="py-2 w-44">
                                  <div className="flex items-center gap-1.5">
                                    <Input
                                      type="number"
                                      min={0}
                                      step={1}
                                      inputMode="numeric"
                                      aria-label="Jumlah bahan per porsi"
                                      className="h-8 w-20 rounded-lg text-xs font-semibold tabular-nums"
                                      placeholder="1"
                                      value={row.jumlah}
                                      onChange={(e) =>
                                        updateRow(row.key, {
                                          jumlah: e.target.value,
                                        })
                                      }
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                      {bahan
                                        ? satuanLabels[
                                            bahan.satuan
                                          ] ?? bahan.satuan
                                        : 'satuan'}
                                    </span>
                                  </div>
                                </TableCell>

                                <TableCell className="py-2 w-24 text-right">
                                  {bahan ? (
                                    <Badge
                                      variant="outline"
                                      className={
                                        kurang
                                          ? 'text-[10px] text-amber-700 border-amber-300'
                                          : 'text-[10px]'
                                      }
                                      title={
                                        kurang
                                          ? 'Jumlah resep melebihi stok bahan dapur saat ini'
                                          : undefined
                                      }
                                    >
                                      {bahan.stokQty}{' '}
                                      {satuanLabels[
                                        bahan.satuan
                                      ] ?? bahan.satuan}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell className="py-2 w-10 text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    title="Hapus baris ini"
                                    onClick={() =>
                                      mutateRows((prev) => {
                                        // Kalau baris ini satu-satunya baris
                                        // di kategorinya, kosongkan saja
                                        // supaya kategori tetap punya baris.
                                        const barisKategori = prev.filter(
                                          (r) =>
                                            r.kategori === row.kategori
                                        );
                                        if (barisKategori.length > 1) {
                                          return prev.filter(
                                            (r) => r.key !== row.key
                                          );
                                        }
                                        return prev.map((r) =>
                                          r.key === row.key
                                            ? {
                                                ...r,
                                                stokBahanId: null,
                                                jumlah: '',
                                              }
                                            : r
                                        );
                                      })
                                    }
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-xs text-muted-foreground border-t pt-3">
              {jumlahBahanTerpilih} bahan dipakai
              {jumlahBahanTerpilih > 0 && (
                <>
                  {' · '}Estimasi biaya bahan Rp{' '}
                  <span className="font-semibold text-foreground">
                    {Math.round(totalBiaya).toLocaleString(
                      'id-ID'
                    )}
                  </span>{' '}
                  / porsi
                </>
              )}
            </div>

            {error && (
              <p className="text-xs text-destructive">
                {error}
              </p>
            )}
            {duplikat && (
              <p className="text-xs text-destructive">
                Ada bahan yang sama Terpilih lebih dari
                sekali.
              </p>
            )}
            {belumPilihBahan && (
              <p className="text-xs text-amber-700">
                Ada baris yang punya jumlah tapi bahan
                belum dipilih. Pilih bahan dulu atau
                hapus baris tersebut.
              </p>
            )}
            {jumlahTanpaBahan && (
              <p className="text-xs text-amber-700">
                Ada bahan yang dipilih tapi jumlahnya masih 0
                atau kosong. Isi jumlahnya atau kosongkan baris
                tersebut.
              </p>
            )}
            {tidakLengkap && (
              <p className="text-xs text-amber-700">
                {wajibBumbu
                  ? 'Menu kategori Makanan wajib punya 1 bahan utama dan 1 bahan bumbu.'
                  : 'Bumbu opsional untuk menu kategori ini. Cukup minimal 1 bahan utama.'}
              </p>
            )}
            {saved && !error && (
              <p className="text-xs text-emerald-700">
                Resep tersimpan. Stok akan terpotong otomatis
                saat pesanan {namaMenu} ditandai selesai.
              </p>
            )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          {!loading &&
            !belumAdaBahanDapur && (
              <Button
                size="sm"
                className="h-8 text-xs"
                disabled={
                  saving ||
                  duplikat ||
                  belumPilihBahan ||
                  jumlahTanpaBahan
                }
                onClick={handleSave}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {saving
                  ? 'Menyimpan...'
                  : 'Simpan Resep'}
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
