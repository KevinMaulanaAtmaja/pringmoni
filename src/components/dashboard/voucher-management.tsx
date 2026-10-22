'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Ticket, Loader2, Search, ToggleLeft, ToggleRight } from 'lucide-react';

import {
  getVoucherList,
  createVoucher,
  updateVoucher,
  setStatusVoucher,
  deleteVoucher,
  type VoucherWithUsage,
} from '@/app/actions/voucher';

type FormState = {
  kode: string;
  namaVoucher: string;
  deskripsi: string;
  diskonPersen: string;
  minimalBelanja: string;
  statusVoucher: 'aktif' | 'nonaktif';
};

const formKosong: FormState = {
  kode: '',
  namaVoucher: '',
  deskripsi: '',
  diskonPersen: '',
  minimalBelanja: '0',
  statusVoucher: 'aktif',
};

function formatRupiah(nilai: number): string {
  return `Rp ${Math.round(nilai).toLocaleString('id-ID')}`;
}

export function VoucherManagement({ tabs }: { tabs?: ReactNode } = {}) {
  const [vouchers, setVouchers] = useState<VoucherWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(formKosong);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const muatVoucher = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVoucherList();
      setVouchers(data);
    } catch {
      setError('Gagal memuat data voucher');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void muatVoucher();
  }, [muatVoucher]);

  const vouchersTersaring = vouchers.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      v.kode.toLowerCase().includes(q) ||
      v.namaVoucher.toLowerCase().includes(q)
    );
  });

  const bukaTambah = () => {
    setEditingId(null);
    setForm(formKosong);
    setError(null);
    setIsOpen(true);
  };

  const bukaEdit = (voucher: VoucherWithUsage) => {
    setEditingId(voucher.id);
    setForm({
      kode: voucher.kode,
      namaVoucher: voucher.namaVoucher,
      deskripsi: voucher.deskripsi ?? '',
      diskonPersen: String(voucher.diskonPersen),
      minimalBelanja: String(voucher.minimalBelanja),
      statusVoucher: voucher.statusVoucher,
    });
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const diskonPersen = Number(form.diskonPersen);
    const minimalBelanja = Number(form.minimalBelanja);

    if (!form.kode.trim()) {
      setError('Kode voucher wajib diisi');
      return;
    }
    if (!form.namaVoucher.trim()) {
      setError('Nama voucher wajib diisi');
      return;
    }
    if (!Number.isInteger(diskonPersen) || diskonPersen < 1 || diskonPersen > 100) {
      setError('Diskon harus berupa angka bulat antara 1 sampai 100');
      return;
    }
    if (!Number.isFinite(minimalBelanja) || minimalBelanja < 0) {
      setError('Minimal belanja tidak boleh negatif');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        kode: form.kode.trim(),
        namaVoucher: form.namaVoucher.trim(),
        deskripsi: form.deskripsi.trim() || null,
        diskonPersen,
        minimalBelanja,
        statusVoucher: form.statusVoucher,
      };

      const hasil =
        editingId === null
          ? await createVoucher(payload)
          : await updateVoucher(editingId, payload);

      if ('error' in hasil && hasil.error) {
        setError(hasil.error);
        setSubmitting(false);
        return;
      }

      setIsOpen(false);
      setEditingId(null);
      setForm(formKosong);
      await muatVoucher();
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (voucher: VoucherWithUsage) => {
    const statusBaru = voucher.statusVoucher === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await setStatusVoucher(voucher.id, statusBaru);
      await muatVoucher();
    } catch {
      setError('Gagal mengubah status voucher');
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteVoucher(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
      await muatVoucher();
    } catch {
      setError('Gagal menghapus voucher');
    }
  };

  const voucherTerhapus = vouchers.find((v) => v.id === deleteId);
  const jumlahAktif = vouchers.filter((v) => v.statusVoucher === 'aktif').length;
  const jumlahNonaktif = vouchers.length - jumlahAktif;
  const totalDipakai = vouchers.reduce((sum, v) => sum + v.jumlahDipakai, 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Ticket className="size-5" />
              </span>
              Kelola Voucher
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Buat kode voucher, atur diskon &amp; minimal belanja, dan aktifkan untuk pelanggan.
            </p>
          </div>
          <Button onClick={bukaTambah} className="rounded-full">
            <Plus className="size-4 mr-1.5" />
            Tambah Voucher
          </Button>
        </div>
        {tabs}
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Voucher</p>
          <p className="text-2xl font-bold mt-1">{vouchers.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{jumlahAktif}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Nonaktif</p>
          <p className="text-2xl font-bold mt-1 text-gray-500">{jumlahNonaktif}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama voucher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-[280px] pl-9 text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Total penggunaan: <span className="font-medium text-foreground">{totalDipakai}x</span>
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Memuat voucher...</span>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-center">Diskon</TableHead>
                <TableHead>Min. Belanja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Dipakai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchersTersaring.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-14">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Ticket className="size-8 opacity-40" />
                      <p className="text-sm">
                        {search ? 'Voucher tidak ditemukan.' : 'Belum ada voucher.'}
                      </p>
                      {!search && (
                        <Button variant="outline" size="sm" className="mt-1 rounded-full" onClick={bukaTambah}>
                          <Plus className="size-4 mr-1.5" />
                          Tambah Voucher Pertama
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vouchersTersaring.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded-md">
                        {voucher.kode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{voucher.namaVoucher}</p>
                      {voucher.deskripsi && (
                        <p className="text-xs text-muted-foreground">{voucher.deskripsi}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-primary">{voucher.diskonPersen}%</span>
                    </TableCell>
                    <TableCell>{formatRupiah(voucher.minimalBelanja)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          voucher.statusVoucher === 'aktif'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {voucher.statusVoucher === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {voucher.jumlahDipakai}x
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          title={voucher.statusVoucher === 'aktif' ? 'Nonaktifkan voucher' : 'Aktifkan voucher'}
                          onClick={() => handleToggleStatus(voucher)}
                        >
                          {voucher.statusVoucher === 'aktif' ? (
                            <>
                              <ToggleRight className="size-4 mr-1 text-green-600" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="size-4 mr-1 text-gray-400" />
                              Nonaktif
                            </>
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          title="Edit voucher"
                          onClick={() => bukaEdit(voucher)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive hover:text-destructive"
                          title="Hapus voucher"
                          onClick={() => {
                            setDeleteId(voucher.id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog form voucher */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId === null ? 'Tambah Voucher' : 'Edit Voucher'}</DialogTitle>
            <DialogDescription>
              Kode voucher dipakai customer saat checkout. Diskon dihitung dari persentase.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="kode">Kode Voucher</Label>
              <Input
                id="kode"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                placeholder="PRINGMONI10"
                className="uppercase"
                maxLength={30}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="namaVoucher">Nama Voucher</Label>
              <Input
                id="namaVoucher"
                value={form.namaVoucher}
                onChange={(e) => setForm({ ...form, namaVoucher: e.target.value })}
                placeholder="Diskon 10% Semua Menu"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
              <Input
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Berlaku untuk seluruh menu"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="diskonPersen">Diskon (%)</Label>
                <Input
                  id="diskonPersen"
                  type="number"
                  min={1}
                  max={100}
                  value={form.diskonPersen}
                  onChange={(e) => setForm({ ...form, diskonPersen: e.target.value })}
                  placeholder="10"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="minimalBelanja">Min. Belanja (Rp)</Label>
                <Input
                  id="minimalBelanja"
                  type="number"
                  min={0}
                  value={form.minimalBelanja}
                  onChange={(e) => setForm({ ...form, minimalBelanja: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="statusVoucher">Status</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={form.statusVoucher === 'aktif' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setForm({ ...form, statusVoucher: 'aktif' })}
                >
                  Aktif
                </Button>
                <Button
                  type="button"
                  variant={form.statusVoucher === 'nonaktif' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setForm({ ...form, statusVoucher: 'nonaktif' })}
                >
                  Nonaktif
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Voucher</DialogTitle>
            <DialogDescription>
              Voucher {voucherTerhapus?.kode} akan dihapus dan tidak bisa dipakai customer lagi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
