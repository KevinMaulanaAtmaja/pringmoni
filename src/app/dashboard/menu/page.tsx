'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
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
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Upload,
} from 'lucide-react';

import {
  getMenus,
  getKategoriMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  MenuWithKategori,
  createKategori,
  updateKategori,
  deleteKategori,
} from '@/app/actions/menu';

type ActionResult = { success: boolean } | { error: string };

import {
  saveMenuFotoUrls,
  deleteMenuFoto,
  getMenuFotos,
} from '@/app/actions/menu-foto';

import { useUploadThing } from '@/lib/uploadthing-client';

type StatusMenu = 'tersedia' | 'habis' | 'nonaktif';

type KategoriMenu = {
  id: number;
  namaKategori: string;
  createdAt: Date;
  deletedAt: Date | null;
};

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

const ITEMS_PER_PAGE = 5;

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
  const [error, setError] = useState<string | null>(null);

  // Delete menu states
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Category states
  const [isKategoriOpen, setIsKategoriOpen] = useState(false);
  const [editingKategori, setEditingKategori] =
    useState<KategoriMenu | null>(null);

  const [kategoriForm, setKategoriForm] = useState({
    namaKategori: '',
  });

  const [deleteKategoriId, setDeleteKategoriId] = useState<number | null>(
    null
  );

  const [deleteKategoriName, setDeleteKategoriName] = useState('');
  const [isDeleteKategoriOpen, setIsDeleteKategoriOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Price formatting
  const [priceDisplay, setPriceDisplay] = useState('');
  const [priceValue, setPriceValue] = useState<number | ''>('');

  // Photo states
  const [uploadedFotoUrls, setUploadedFotoUrls] = useState<string[]>([]);
  const [uploadedFileKeys, setUploadedFileKeys] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [existingFotos, setExistingFotos] = useState<
    Array<{
      id: number;
      fotoUrl: string;
      fileKey: string | null;
    }>
  >([]);

  const [deleteFotoId, setDeleteFotoId] = useState<number | null>(null);
  const [deleteFotoUrl, setDeleteFotoUrl] = useState('');
  const [isDeleteFotoOpen, setIsDeleteFotoOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [imageLoading, setImageLoading] = useState<
    Record<string, boolean>
  >({});

  const totalPhotos =
    existingFotos.length + uploadedFotoUrls.length;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing('menuFoto', {
    onClientUploadComplete: (
      res: { url: string; key: string }[]
    ) => {
      setUploading(false);

      if (res) {
        const urls = res.map((file) => file.url);
        const keys = res.map((file) => file.key);

        const currentTotal =
          existingFotos.length + uploadedFotoUrls.length;

        if (currentTotal + urls.length > 5) {
          alert(
            'Maksimal 5 foto per menu. Hapus foto lama jika ingin menambah foto baru.'
          );

          keys.forEach(async (key) => {
            try {
              await fetch('/api/uploadthing/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fileKey: key,
                }),
              });
            } catch (error) {
              console.error(
                'Error deleting file:',
                error
              );
            }
          });

          return;
        }

        const newLoadingState: Record<string, boolean> =
          {};

        urls.forEach((url) => {
          newLoadingState[url] = true;
        });

        setImageLoading((prev) => ({
          ...prev,
          ...newLoadingState,
        }));

        setUploadedFotoUrls((prev) => [
          ...prev,
          ...urls,
        ]);

        setUploadedFileKeys((prev) => [
          ...prev,
          ...keys,
        ]);
      }
    },

    onUploadError: (error: Error) => {
      setUploading(false);
      alert('Gagal upload: ' + error.message);
    },

    onUploadBegin: () => setUploading(true),
  });

  // Menu name states
  const [duplicateWarning, setDuplicateWarning] =
    useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadKategoris = async () => {
    try {
      const result = await getKategoriMenus();
      setKategoris(result);
    } catch {
      // Handle error
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterKategori, filterStatus]);

  async function loadData() {
    setLoading(true);

    try {
      const [menusData, kategorisData] =
        await Promise.all([
          getMenus(),
          getKategoriMenus(),
        ]);

      setMenus(menusData);
      setKategoris(kategorisData);
    } catch {
      setMenus([]);
      setKategoris([]);
    } finally {
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

      // Set price value in thousands
      setPriceValue(Math.floor(menu.harga / 1000));

      // Load existing photos
      loadMenuFotos(menu.id);
    } else {
      setEditingId(null);

      setForm({
        namaMenu: '',
        deskripsi: '',
        harga: '',
        kategoriId:
          kategoris[0]?.id.toString() || '',
        statusMenu: 'tersedia',
      });

      setPriceDisplay('');
      setPriceValue('');
      setExistingFotos([]);
    }

    setDuplicateWarning('');
    setUploadedFotoUrls([]);
    setUploadedFileKeys([]);
    setIsOpen(true);
  }

  async function loadMenuFotos(menuId: number) {
    try {
      const fotos = await getMenuFotos(menuId);

      const mappedFotos = fotos.map((f) => {
        const foto = f as unknown as {
          id: number;
          fotoUrl: string;
          fileKey?: string | null;
        };

        return {
          id: foto.id,
          fotoUrl: foto.fotoUrl,
          fileKey: foto.fileKey ?? null,
        };
      });

      setExistingFotos(mappedFotos);
    } catch {
      setExistingFotos([]);
    }
  }

  function handleDeleteFoto(
    fotoId: number,
    fotoUrl: string
  ) {
    setDeleteFotoId(fotoId);
    setDeleteFotoUrl(fotoUrl);
    setIsDeleteFotoOpen(true);
  }

  async function confirmDeleteFoto() {
    if (!deleteFotoId) return;

    try {
      await deleteMenuFoto(deleteFotoId);

      if (editingId) {
        loadMenuFotos(editingId);
      }

      setIsDeleteFotoOpen(false);
      setDeleteFotoId(null);
      setDeleteFotoUrl('');
    } catch {
      alert('Gagal menghapus foto');
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
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

      // Validation
      if (!data.namaMenu?.trim()) {
        alert('Nama menu wajib diisi');
        setSubmitting(false);
        return;
      }

      if (data.harga <= 0) {
        alert('Harga harus lebih dari 0');
        setSubmitting(false);
        return;
      }

      let menuId = editingId;

      if (editingId) {
        const result = await updateMenu({
          id: editingId,
          ...data,
        });

        if (
          result &&
          'error' in result &&
          result.error
        ) {
          alert(result.error);
          setSubmitting(false);
          return;
        }

        // Add new photos without deleting old ones
        if (uploadedFotoUrls.length > 0) {
          await saveMenuFotoUrls(
            editingId,
            uploadedFotoUrls,
            uploadedFileKeys
          );
        }
      } else {
        const result = await createMenu(data);

        if (
          result &&
          'error' in result &&
          result.error
        ) {
          alert(result.error);
          setSubmitting(false);
          return;
        }

        menuId = (
          result as {
            id: number;
          }
        ).id;

        // Save uploaded photo URLs
        if (
          uploadedFotoUrls.length > 0 &&
          menuId
        ) {
          await saveMenuFotoUrls(
            menuId,
            uploadedFotoUrls,
            uploadedFileKeys
          );
        }
      }

      setIsOpen(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    setIsDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;

    const result = await deleteMenu(deleteId);

    if ('error' in result && result.error) {
      alert(result.error);
      setIsDeleteOpen(false);
      setDeleteId(null);
      return;
    }

    setIsDeleteOpen(false);
    setDeleteId(null);

    loadData();
  }

  // Category handlers
  function openKategoriDialog(
    kategori?: KategoriMenu
  ) {
    if (kategori) {
      setEditingKategori(kategori);

      setKategoriForm({
        namaKategori: kategori.namaKategori,
      });
    } else {
      setEditingKategori(null);

      setKategoriForm({
        namaKategori: '',
      });
    }

    setIsKategoriOpen(true);
  }

  async function handleKategoriSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSubmitting(true);

    try {
      if (editingKategori) {
        const result =
          (await updateKategori(
            editingKategori.id,
            kategoriForm
          )) as ActionResult;

        if (
          'error' in result &&
          result.error
        ) {
          setError(result.error);
          return;
        }
      } else {
        const result =
          (await createKategori(
            kategoriForm
          )) as ActionResult;

        if (
          'error' in result &&
          result.error
        ) {
          setError(result.error);
          return;
        }
      }

      setIsKategoriOpen(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteKategori(
    id: number,
    name: string
  ) {
    setDeleteKategoriId(id);
    setDeleteKategoriName(name);
    setIsDeleteKategoriOpen(true);
  }

  async function confirmDeleteKategori() {
    if (!deleteKategoriId) return;

    const result =
      await deleteKategori(deleteKategoriId);

    if (
      'error' in result &&
      result.error
    ) {
      alert(result.error);
      return;
    }

    setIsDeleteKategoriOpen(false);
    setDeleteKategoriId(null);
    setDeleteKategoriName('');

    loadData();
  }

  function formatHarga(harga: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga);
  }

  // Filter logic
  const filteredMenus = useMemo(() => {
    let result = menus;

    if (search) {
      const s = search.toLowerCase();

      result = result.filter(
        (m) =>
          m.namaMenu
            .toLowerCase()
            .includes(s) ||
          (m.deskripsi &&
            m.deskripsi
              .toLowerCase()
              .includes(s))
      );
    }

    if (filterKategori !== 'all') {
      result = result.filter(
        (m) =>
          m.kategoriId ===
          parseInt(filterKategori)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(
        (m) =>
          m.statusMenu === filterStatus
      );
    }

    return result;
  }, [
    menus,
    search,
    filterKategori,
    filterStatus,
  ]);

  // Pagination
  const totalPages = Math.ceil(
    filteredMenus.length /
      ITEMS_PER_PAGE
  );

  const paginatedMenus =
    filteredMenus.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">
          Kelola Menu
        </h1>
      </div>

      {/* Filters + Tambah Button */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="h-8 w-[200px] text-sm px-3"
        />

        <Select
          value={filterKategori}
          onValueChange={
            setFilterKategori
          }
        >
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Semua
            </SelectItem>

            {kategoris.map((kat) => (
              <SelectItem
                key={kat.id}
                value={kat.id.toString()}
              >
                {kat.namaKategori}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Semua
            </SelectItem>

            <SelectItem value="tersedia">
              Tersedia
            </SelectItem>

            <SelectItem value="habis">
              Habis
            </SelectItem>

            <SelectItem value="nonaktif">
              Nonaktif
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => openDialog()}
          className="h-8 ml-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Menu
        </Button>

        <Button
          onClick={() =>
            openKategoriDialog()
          }
          variant="outline"
          className="h-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-9">
              <TableHead className="h-9">
                No
              </TableHead>

              <TableHead className="h-9">
                Foto
              </TableHead>

              <TableHead className="h-9">
                Menu
              </TableHead>

              <TableHead className="h-9">
                Kategori
              </TableHead>

              <TableHead className="h-9">
                Harga
              </TableHead>

              <TableHead className="h-9">
                Status
              </TableHead>

              <TableHead className="h-9 text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              /* FIX CONFLICT:
                 gunakan loading skeleton dari commit lokal */
              Array.from({
                length: ITEMS_PER_PAGE,
              }).map((_, i) => (
                <TableRow
                  key={i}
                  className="h-12"
                >
                  <TableCell className="py-2">
                    <div className="h-4 w-5 bg-gray-200 rounded animate-pulse" />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="space-y-1.5 max-w-xs">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                  </TableCell>

                  <TableCell className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <div className="h-7 w-7 bg-gray-200 rounded animate-pulse" />
                      <div className="h-7 w-7 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedMenus.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-4"
                >
                  {search ||
                  filterKategori !== 'all' ||
                  filterStatus !== 'all'
                    ? 'Tidak ada menu yang sesuai filter'
                    : 'Belum ada menu'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMenus.map(
                (menu, index) => (
                  <TableRow
                    key={menu.id}
                    className="h-12"
                  >
                    <TableCell className="py-2">
                      {(currentPage - 1) *
                        ITEMS_PER_PAGE +
                        index +
                        1}
                    </TableCell>

                    <TableCell className="py-2">
                      {menu.fotoUrl ? (
                        <div className="flex gap-1 overflow-x-auto max-w-[120px]">
                          <img
                            src={menu.fotoUrl}
                            alt={menu.namaMenu}
                            loading="lazy"
                            decoding="async"
                            className="w-10 h-10 object-cover rounded flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              setPreviewImage(
                                menu.fotoUrl
                              )
                            }
                            onError={(e) => {
                              (
                                e.target as HTMLImageElement
                              ).src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFRUVGRUYiIHJ4PSI0Ii8+PHBhdGggZD0iTTE2IDMwTDI0IDMwTTIwIDI2TDIwIDM0TTIwIDI2QzE3Ljc5IDE2IDE2IDE2IDE2IDE2QzE2IDE2IDE0IDE4IDE0IDIwQzE0IDIyIDE2IDI0IDIwIDI2Wk0yNiAyMEMyNiAxOCAyNCAxNiAyNCAxNkMyNCAxNiAyMiAxOCAyMiAyMEMyMiAyMiAyNCAyNCAyNiAyNloiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                            }}
                          />

                          {menu.fotoUrls
                            ?.slice(1)
                            .map(
                              (
                                url,
                                idx
                              ) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`${menu.namaMenu} ${
                                    idx + 2
                                  }`}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-10 h-10 object-cover rounded flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() =>
                                    setPreviewImage(
                                      url
                                    )
                                  }
                                  onError={(
                                    e
                                  ) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).src =
                                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFRUVGRUYiIHJ4PSI0Ii8+PHBhdGggZD0iTTE2IDMwTDI0IDMwTTIwIDI2TDIwIDM0TTIwIDI2QzE3Ljc5IDE2IDE2IDE2IDE2IDE2QzE2IDE2IDE0IDE4IDE0IDIwQzE0IDIyIDE2IDI0IDIwIDI2Wk0yNiAyMEMyNiAxOCAyNCAxNiAyNCAxNkMyNCAxNiAyMiAxOCAyMiAyMEMyMiAyMiAyNCAyNCAyNiAyNloiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
                                  }}
                                />
                              )
                            )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="max-w-xs">
                        <p className="font-medium text-sm truncate">
                          {menu.namaMenu}
                        </p>

                        {menu.deskripsi && (
                          <p
                            className="text-xs text-gray-500 truncate"
                            title={
                              menu.deskripsi
                            }
                          >
                            {menu.deskripsi}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2 text-sm">
                      {
                        menu.kategori
                          .namaKategori
                      }
                    </TableCell>

                    <TableCell className="py-2 text-sm">
                      {formatHarga(
                        menu.harga
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <Badge
                        className={`${statusColors[menu.statusMenu]} text-xs`}
                      >
                        {
                          statusLabels[
                            menu.statusMenu
                          ]
                        }
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            openDialog(menu)
                          }
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleDelete(
                              menu.id
                            )
                          }
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() =>
              setCurrentPage((p) =>
                Math.max(1, p - 1)
              )
            }
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>

          <span className="text-xs">
            {currentPage}/{totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(
                  totalPages,
                  p + 1
                )
              )
            }
            disabled={
              currentPage === totalPages
            }
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Menu Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingId
                ? 'Edit Menu'
                : 'Tambah Menu Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-1 py-1">
              {/* Nama Menu */}
              <div className="grid gap-1">
                <Label
                  htmlFor="namaMenu"
                  className="text-xs"
                >
                  Nama Menu
                </Label>

                <Input
                  id="namaMenu"
                  value={form.namaMenu}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setForm({
                      ...form,
                      namaMenu: value,
                    });

                    if (
                      value &&
                      !editingId
                    ) {
                      const duplicate =
                        menus.find(
                          (m) =>
                            m.namaMenu
                              .toLowerCase() ===
                              value.toLowerCase() &&
                            m.deletedAt ===
                              null
                        );

                      setDuplicateWarning(
                        duplicate
                          ? 'Menu dengan nama ini sudah ada'
                          : ''
                      );
                    } else if (
                      editingId &&
                      value
                    ) {
                      const duplicate =
                        menus.find(
                          (m) =>
                            m.namaMenu
                              .toLowerCase() ===
                              value.toLowerCase() &&
                            m.id !==
                              editingId &&
                            m.deletedAt ===
                              null
                        );

                      setDuplicateWarning(
                        duplicate
                          ? 'Menu dengan nama ini sudah ada'
                          : ''
                      );
                    } else {
                      setDuplicateWarning(
                        ''
                      );
                    }
                  }}
                  className={`h-7 text-xs ${
                    duplicateWarning
                      ? 'border-red-500'
                      : ''
                  }`}
                  required
                />

                {duplicateWarning && (
                  <p className="text-xs text-red-500">
                    {duplicateWarning}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="grid gap-1">
                <Label
                  htmlFor="deskripsi"
                  className="text-xs"
                >
                  Deskripsi
                </Label>

                <textarea
                  id="deskripsi"
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deskripsi:
                        e.target.value,
                    })
                  }
                  className="w-full min-h-[60px] rounded-lg border border-input bg-input/30 px-3 py-1 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50 resize-y"
                  rows={2}
                />
              </div>

              {/* Harga */}
              <div className="grid gap-2 mt-2">
                <div className="grid gap-1">
                  <Label
                    htmlFor="harga"
                    className="text-xs"
                  >
                    Harga (Ribuan) *
                  </Label>

                  <div className="relative">
                    <Input
                      id="harga"
                      type="text"
                      inputMode="numeric"
                      value={
                        priceValue || ''
                      }
                      onChange={(e) => {
                        const raw =
                          e.target.value.replace(
                            /[^\d]/g,
                            ''
                          );

                        const num =
                          parseInt(raw) ||
                          0;

                        setPriceValue(num);

                        setForm({
                          ...form,
                          harga: (
                            num * 1000
                          ).toString(),
                        });
                      }}
                      className="h-6 text-xs pr-10"
                      placeholder="Contoh: 25"
                      required
                    />

                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">
                      .000
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    Isi angka dalam ribuan,
                    misal: 25 untuk Rp
                    25.000
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {/* Kategori */}
                  <div className="grid gap-1">
                    <Label
                      htmlFor="kategoriId"
                      className="text-xs"
                    >
                      Kategori
                    </Label>

                    <Select
                      value={
                        form.kategoriId
                      }
                      onValueChange={(
                        value
                      ) =>
                        setForm({
                          ...form,
                          kategoriId:
                            value,
                        })
                      }
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>

                      <SelectContent>
                        {kategoris.map(
                          (kat) => (
                            <SelectItem
                              key={kat.id}
                              value={kat.id.toString()}
                            >
                              {
                                kat.namaKategori
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="grid gap-1">
                    <Label
                      htmlFor="statusMenu"
                      className="text-xs"
                    >
                      Status
                    </Label>

                    <Select
                      value={
                        form.statusMenu
                      }
                      onValueChange={(
                        value
                      ) =>
                        setForm({
                          ...form,
                          statusMenu:
                            value as StatusMenu,
                        })
                      }
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="tersedia">
                          Tersedia
                        </SelectItem>

                        <SelectItem value="habis">
                          Habis
                        </SelectItem>

                        <SelectItem value="nonaktif">
                          Nonaktif
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="grid gap-1">
                <Label className="text-xs font-medium">
                  Foto Menu
                </Label>

                {/* Existing Photos */}
                {existingFotos.length >
                  0 && (
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                    {existingFotos.map(
                      (foto) => (
                        <div
                          key={foto.id}
                          className="relative group flex-shrink-0"
                        >
                          <img
                            src={
                              foto.fotoUrl
                            }
                            alt="Menu"
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              setPreviewImage(
                                foto.fotoUrl
                              )
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteFoto(
                                foto.id,
                                foto.fotoUrl
                              )
                            }
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Newly Uploaded Photos */}
                {uploadedFotoUrls.length >
                  0 && (
                  <div className="flex flex-wrap gap-1">
                    {uploadedFotoUrls.map(
                      (url, index) => (
                        <div
                          key={index}
                          className="relative group"
                        >
                          <img
                            src={url}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              setPreviewImage(
                                url
                              )
                            }
                          />

                          <button
                            type="button"
                            onClick={async () => {
                              const fileKey =
                                uploadedFileKeys[
                                  index
                                ];

                              if (fileKey) {
                                try {
                                  const response =
                                    await fetch(
                                      '/api/uploadthing/delete',
                                      {
                                        method:
                                          'POST',
                                        headers:
                                          {
                                            'Content-Type':
                                              'application/json',
                                          },
                                        body: JSON.stringify(
                                          {
                                            fileKey,
                                          }
                                        ),
                                      }
                                    );

                                  if (
                                    !response.ok
                                  ) {
                                    console.error(
                                      'Failed to delete file from UploadThing'
                                    );
                                  }
                                } catch (
                                  error
                                ) {
                                  console.error(
                                    'Error deleting file:',
                                    error
                                  );
                                }
                              }

                              setUploadedFotoUrls(
                                (prev) =>
                                  prev.filter(
                                    (
                                      _,
                                      i
                                    ) =>
                                      i !==
                                      index
                                  )
                              );

                              setUploadedFileKeys(
                                (prev) =>
                                  prev.filter(
                                    (
                                      _,
                                      i
                                    ) =>
                                      i !==
                                      index
                                  )
                              );
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* UploadThing Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={async (
                      e
                    ) => {
                      const files =
                        Array.from(
                          e.target.files ||
                            []
                        );

                      if (
                        files.length ===
                        0
                      )
                        return;

                      const renamed =
                        files.map(
                          (f) =>
                            new File(
                              [
                                f,
                              ],
                              `${crypto.randomUUID()}.${f.name.split('.').pop()}`,
                              {
                                type: f.type,
                              }
                            )
                        );

                      await startUpload(
                        renamed
                      );

                      e.target.value =
                        '';
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      totalPhotos >=
                        5 ||
                      uploading
                    }
                    className="w-12 h-12 flex items-center justify-center border-none bg-transparent cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-10 h-10 text-blue-600 hover:text-blue-800" />
                    )}
                  </button>

                  <p className="text-[10px] text-gray-500">
                    {`${totalPhotos}/5 foto`}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsOpen(false)
                }
                className="h-7 text-xs px-3"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="h-7 text-xs px-3"
              >
                {submitting
                  ? '...'
                  : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={isKategoriOpen}
        onOpenChange={(open) => {
          setIsKategoriOpen(open);

          if (!open) {
            setEditingKategori(null);
            setKategoriForm({
              namaKategori: '',
            });
            setError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Kelola Kategori Menu
            </DialogTitle>
          </DialogHeader>

          {/* Daftar Kategori */}
          <div className="max-h-48 overflow-y-auto space-y-2 my-3">
            {kategoris.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">
                Belum ada kategori
              </p>
            ) : (
              kategoris.map((kat) => (
                <div
                  key={kat.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium">
                    {
                      kat.namaKategori
                    }
                  </span>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        openKategoriDialog(
                          kat
                        )
                      }
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      onClick={() =>
                        handleDeleteKategori(
                          kat.id,
                          kat.namaKategori
                        )
                      }
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Tambah/Edit */}
          <form
            onSubmit={
              handleKategoriSubmit
            }
          >
            <div className="grid gap-2 py-2 border-t pt-3">
              <Label
                htmlFor="namaKategori"
                className="text-xs"
              >
                {editingKategori
                  ? 'Edit Kategori'
                  : 'Tambah Kategori Baru'}
              </Label>

              <div className="flex gap-2">
                <Input
                  id="namaKategori"
                  value={
                    kategoriForm.namaKategori
                  }
                  onChange={(e) =>
                    setKategoriForm({
                      namaKategori:
                        e.target.value,
                    })
                  }
                  placeholder="Nama kategori..."
                  className="h-8 text-xs"
                  required
                />

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-8"
                >
                  {submitting
                    ? '...'
                    : editingKategori
                      ? 'Update'
                      : 'Tambah'}
                </Button>
              </div>

              {error && (
                <p className="text-xs text-red-500">
                  {error}
                </p>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Foto Dialog */}
      <Dialog
        open={isDeleteFotoOpen}
        onOpenChange={
          setIsDeleteFotoOpen
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Konfirmasi Hapus Foto
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-500">
              Yakin ingin menghapus foto
              ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {deleteFotoUrl && (
            <img
              src={deleteFotoUrl}
              alt="Preview"
              className="w-full max-h-48 object-contain rounded-lg my-2"
            />
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setIsDeleteFotoOpen(false)
              }
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              onClick={
                confirmDeleteFoto
              }
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Konfirmasi Hapus Menu
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-500">
              Menu akan dihapus permanen.
              Tindakan ini tidak dapat
              dibatalkan. Yakin ingin
              melanjutkan?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setIsDeleteOpen(false)
              }
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Kategori Dialog */}
      <Dialog
        open={isDeleteKategoriOpen}
        onOpenChange={
          setIsDeleteKategoriOpen
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Konfirmasi Hapus Kategori
            </DialogTitle>

            <DialogDescription className="text-sm text-gray-500">
              Kategori{' '}
              <strong>
                {deleteKategoriName}
              </strong>{' '}
              akan dihapus permanen.
              Menu yang menggunakan
              kategori ini tidak akan
              terhapus, tetapi akan
              kehilangan kategori-nya.
              Yakin ingin melanjutkan?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setIsDeleteKategoriOpen(
                  false
                )
              }
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              onClick={
                confirmDeleteKategori
              }
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewImage !== null}
        onOpenChange={() =>
          setPreviewImage(null)
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Preview Foto
            </DialogTitle>
          </DialogHeader>

          {previewImage && (
            <div className="flex items-center justify-center p-4">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setPreviewImage(null)
              }
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}