'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMenus,
  getKategoriMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  MenuWithKategori,
} from '@/app/actions/menu';
import { KategoriMenu, StatusMenu } from '@prisma/client';

const statusColors: Record<StatusMenu, string> = {
  tersedia: 'bg-green-100 text-green-800',
  habis: 'bg-yellow-100 text-yellow-800',
  nonaktif: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<StatusMenu, string> = {
  tersedia: 'Tersedia',
  habis: 'Habis',
  nonaktif: 'Nonaktif',
};

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuWithKategori[]>([]);
  const [kategoris, setKategoris] = useState<KategoriMenu[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    namaMenu: '',
    deskripsi: '',
    harga: '',
    kategoriId: '',
    statusMenu: 'tersedia' as StatusMenu,
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [menusData, kategorisData] = await Promise.all([
        getMenus(),
        getKategoriMenus(),
      ]);
      setMenus(menusData);
      setKategoris(kategorisData);
    } catch {
      setMenus([]);
      setKategoris([]);
    } finally {
      setCurrentPage(1);
      setLoading(false);
    }
  }

  function openDialog(menu?: MenuWithKategori) {
    if (menu) {
      setEditingId(menu.id);
      setForm({
        namaMenu: menu.namaMenu,
        deskripsi: menu.deskripsi || '',
        harga: menu.harga.toString(),
        kategoriId: menu.kategoriId.toString(),
        statusMenu: menu.statusMenu,
      });
    } else {
      setEditingId(null);
      setForm({
        namaMenu: '',
        deskripsi: '',
        harga: '',
        kategoriId: kategoris[0]?.id.toString() || '',
        statusMenu: 'tersedia',
      });
    }
    setIsOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        namaMenu: form.namaMenu,
        deskripsi: form.deskripsi || undefined,
        harga: parseFloat(form.harga),
        kategoriId: parseInt(form.kategoriId),
        statusMenu: form.statusMenu,
      };
      if (editingId) {
        await updateMenu({ id: editingId, ...data });
      } else {
        await createMenu(data);
      }
      setIsOpen(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Yakin hapus menu ini?')) {
      await deleteMenu(id);
      loadData();
    }
  }

  function formatHarga(harga: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga);
  }

  const totalPages = Math.ceil(menus.length / ITEMS_PER_PAGE);
  const paginatedMenus = menus.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Menu</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Menu
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama Menu</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : paginatedMenus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Belum ada menu
                </TableCell>
              </TableRow>
            ) : (
              paginatedMenus.map((menu, index) => (
                <TableRow key={menu.id}>
                  <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{menu.namaMenu}</p>
                      {menu.deskripsi && (
                        <p className="text-sm text-gray-500 truncate" title={menu.deskripsi}>
                          {menu.deskripsi}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{menu.kategori.namaKategori}</TableCell>
                  <TableCell>{formatHarga(menu.harga)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[menu.statusMenu]}>
                      {statusLabels[menu.statusMenu]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDialog(menu)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(menu.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Menu' : 'Tambah Menu Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="namaMenu">Nama Menu</Label>
                <Input
                  id="namaMenu"
                  value={form.namaMenu}
                  onChange={(e) =>
                    setForm({ ...form, namaMenu: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Input
                  id="deskripsi"
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="harga">Harga</Label>
                <Input
                  id="harga"
                  type="number"
                  min="0"
                  value={form.harga}
                  onChange={(e) =>
                    setForm({ ...form, harga: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kategoriId">Kategori</Label>
                <Select
                  value={form.kategoriId}
                  onValueChange={(value) =>
                    setForm({ ...form, kategoriId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoris.map((kat) => (
                      <SelectItem key={kat.id} value={kat.id.toString()}>
                        {kat.namaKategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statusMenu">Status</Label>
                <Select
                  value={form.statusMenu}
                  onValueChange={(value) =>
                    setForm({ ...form, statusMenu: value as StatusMenu })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="habis">Habis</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
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
    </div>
  );
}
