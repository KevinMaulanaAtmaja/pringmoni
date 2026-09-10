'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  History,
  AlertTriangle,
  PackageX,
  Boxes,
  RotateCcw,
  Wheat,
  Drumstick,
  Beef,
  Fish,
  Shrimp,
  Egg,
  Carrot,
  Salad,
  Leaf,
  Flame,
  Citrus,
  Bean,
  Droplet,
  Milk,
  Coffee,
  GlassWater,
  Sparkles,
  Banana,
  Apple,
  CookingPot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getStokBahanList,
  createStokBahan,
  updateStokBahan,
  deleteStokBahan,
  resetAllStokBahan,
  restockBahan,
  getRiwayatStok,
  StokBahanWithType,
  RiwayatStokWithType,
} from '@/app/actions/stok-bahan'
import { KategoriBahan, SatuanStok, StatusStok } from '@prisma/client'

const kategoriLabels: Record<KategoriBahan, string> = {
  bahan_utama: 'Bahan Utama',
  bumbu: 'Bumbu',
}

const satuanLabels: Record<SatuanStok, string> = {
  kg: 'kg',
  pcs: 'pcs',
  pack: 'pack',
}

const statusColors: Record<StatusStok, string> = {
  tersedia: 'bg-green-100 text-green-800',
  menipis: 'bg-yellow-100 text-yellow-800',
  habis: 'bg-red-100 text-red-800',
}

const statusLabels: Record<StatusStok, string> = {
  tersedia: 'Tersedia',
  menipis: 'Menipis',
  habis: 'Habis',
}

const jenisPerubahanLabels = {
  restock: 'Restock',
  penggunaan: 'Penggunaan',
  koreksi: 'Koreksi',
  limbah: 'Limbah',
} as const

const ITEMS_PER_PAGE = 8

type BahanLogoConfig = {
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  textColor: string
  borderColor: string
}

function getBahanLogoConfig(namaBahan: string, kategori?: KategoriBahan): BahanLogoConfig {
  const n = (namaBahan || '').toLowerCase()

  // 1. Sayuran, Daun & Bumbu Segar (Cek dedaunan/sayuran dulu agar 'bayam' tidak tertukar dengan 'ayam')
  if (
    n.includes('bayam') ||
    n.includes('kangkung') ||
    n.includes('sawi') ||
    n.includes('selada') ||
    n.includes('brokoli') ||
    n.includes('kubis') ||
    n.includes('kol') ||
    n.includes('tomat') ||
    n.includes('timun') ||
    n.includes('sayur')
  ) {
    return {
      icon: Salad,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    }
  }
  if (n.includes('wortel') || n.includes('carrot')) {
    return {
      icon: Carrot,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-200',
    }
  }
  if (
    n.includes('bawang') ||
    n.includes('jahe') ||
    n.includes('kunyit') ||
    n.includes('lengkuas') ||
    n.includes('daun') ||
    n.includes('sereh') ||
    n.includes('teh') ||
    n.includes('seledri')
  ) {
    return {
      icon: Leaf,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
    }
  }
  if (
    n.includes('cabai') ||
    n.includes('cabe') ||
    n.includes('chili') ||
    n.includes('pedas') ||
    n.includes('lada') ||
    n.includes('merica')
  ) {
    return {
      icon: Flame,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500',
      borderColor: 'border-red-200',
    }
  }

  // 2. Telur & Makanan Laut
  if (n.includes('telur') || n.includes('telor') || n.includes('egg')) {
    return {
      icon: Egg,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-200',
    }
  }
  if (
    n.includes('udang') ||
    n.includes('cumi') ||
    n.includes('seafood') ||
    n.includes('lobster') ||
    n.includes('kepiting')
  ) {
    return {
      icon: Shrimp,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-500',
      borderColor: 'border-rose-200',
    }
  }
  if (
    n.includes('ikan') ||
    n.includes('gurame') ||
    n.includes('lele') ||
    n.includes('nila') ||
    n.includes('salmon') ||
    n.includes('tuna') ||
    n.includes('bandeng') ||
    n.includes('patin')
  ) {
    return {
      icon: Fish,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-200',
    }
  }

  // 3. Unggas & Daging
  if (
    n.includes('ayam') ||
    n.includes('bebek') ||
    n.includes('unggas') ||
    n.includes('chicken') ||
    n.includes('duck')
  ) {
    return {
      icon: Drumstick,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    }
  }
  if (
    n.includes('sapi') ||
    n.includes('kambing') ||
    n.includes('daging') ||
    n.includes('beef') ||
    n.includes('buntut') ||
    n.includes('iga')
  ) {
    return {
      icon: Beef,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
    }
  }

  // 4. Susu & Minuman
  if (
    n.includes('susu') ||
    n.includes('keju') ||
    n.includes('cheese') ||
    n.includes('cream') ||
    n.includes('yogurt') ||
    n.includes('milk')
  ) {
    return {
      icon: Milk,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-500',
      borderColor: 'border-sky-200',
    }
  }
  if (n.includes('kopi') || n.includes('coffee') || n.includes('espresso')) {
    return {
      icon: Coffee,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
    }
  }
  if (
    n.includes('air') ||
    n.includes('sirup') ||
    n.includes('jus') ||
    n.includes('soda') ||
    n.includes('minuman')
  ) {
    return {
      icon: GlassWater,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-200',
    }
  }

  // 5. Buah-buahan
  if (
    n.includes('jeruk') ||
    n.includes('lemon') ||
    n.includes('lime') ||
    n.includes('nipis')
  ) {
    return {
      icon: Citrus,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-200',
    }
  }
  if (n.includes('pisang') || n.includes('banana')) {
    return {
      icon: Banana,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    }
  }
  if (
    n.includes('apel') ||
    n.includes('apple') ||
    n.includes('stroberi') ||
    n.includes('berry')
  ) {
    return {
      icon: Apple,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-500',
      borderColor: 'border-rose-200',
    }
  }

  // 6. Tepung, Gandum, Kacang, Minyak & Bumbu
  if (
    n.includes('kacang') ||
    n.includes('kedelai') ||
    n.includes('almond') ||
    n.includes('tahu') ||
    n.includes('tempe')
  ) {
    return {
      icon: Bean,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    }
  }
  if (
    n.includes('beras') ||
    n.includes('tepung') ||
    n.includes('nasi') ||
    n.includes('gandum') ||
    n.includes('terigu') ||
    n.includes('maizena') ||
    n.includes('tapioka')
  ) {
    return {
      icon: Wheat,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    }
  }
  if (
    n.includes('minyak') ||
    n.includes('mentega') ||
    n.includes('margarin') ||
    n.includes('oil') ||
    n.includes('butter')
  ) {
    return {
      icon: Droplet,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-200',
    }
  }
  if (
    n.includes('gula') ||
    n.includes('garam') ||
    n.includes('bumbu') ||
    n.includes('penyedap') ||
    n.includes('msg') ||
    n.includes('micin') ||
    n.includes('kecap') ||
    n.includes('saus') ||
    n.includes('terasi')
  ) {
    return {
      icon: Sparkles,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-200',
    }
  }

  // 7. Fallback Berdasarkan Kategori
  if (kategori === 'bahan_utama') {
    return {
      icon: Beef,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
    }
  }
  if (kategori === 'bumbu') {
    return {
      icon: Flame,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500',
      borderColor: 'border-red-200',
    }
  }

  return {
    icon: CookingPot,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  }
}

function BahanLogo({
  namaBahan,
  kategori,
  className,
  size = 'md',
}: {
  namaBahan: string
  kategori?: KategoriBahan
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const config = getBahanLogoConfig(namaBahan, kategori)
  const IconComponent = config.icon

  const sizeClasses = {
    sm: 'w-6 h-6 rounded-md border',
    md: 'w-8 h-8 rounded-lg border shadow-2xs',
    lg: 'w-10 h-10 rounded-xl border shadow-xs',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
      title={`${namaBahan} (${kategori ? kategoriLabels[kategori] : 'Bahan'})`}
    >
      <IconComponent className={cn(config.textColor, iconSizes[size])} />
    </div>
  )
}

const emptyForm = {
  namaBahan: '',
  kategori: 'bahan_utama' as KategoriBahan,
  stokQty: '0',
  satuan: 'kg' as SatuanStok,
  stokMinimum: '0',
  hargaPerSatuan: '0',
  keterangan: '',
}

export default function StokBahanPage() {
  const [items, setItems] = useState<StokBahanWithType[]>([])
  const [loading, setLoading] = useState(true)

  // Form dialog
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restock dialog
  const [restockId, setRestockId] = useState<number | null>(null)
  const [restockJumlah, setRestockJumlah] = useState('0')
  const [restockKet, setRestockKet] = useState('')
  const [restockSubmitting, setRestockSubmitting] = useState(false)

  // History dialog
  const [historyId, setHistoryId] = useState<number | null>(null)
  const [history, setHistory] = useState<RiwayatStokWithType[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Reset confirmation
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterKategori, filterStatus])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getStokBahanList()
      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function openDialog(item?: StokBahanWithType) {
    setError(null)
    if (item) {
      setEditingId(item.id)
      setForm({
        namaBahan: item.namaBahan,
        kategori: item.kategori,
        stokQty: String(item.stokQty),
        satuan: item.satuan,
        stokMinimum: String(item.stokMinimum),
        hargaPerSatuan: String(item.hargaPerSatuan),
        keterangan: item.keterangan || '',
      })
    } else {
      setEditingId(null)
      setForm({ ...emptyForm })
    }
    setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const cleanName = form.namaBahan.trim()
      if (!cleanName) {
        setError('Nama bahan wajib diisi')
        return
      }

      const payload = {
        namaBahan: cleanName,
        kategori: form.kategori,
        stokQty: parseFloat(form.stokQty) || 0,
        satuan: form.satuan,
        stokMinimum: parseFloat(form.stokMinimum) || 0,
        hargaPerSatuan: parseFloat(form.hargaPerSatuan) || 0,
        keterangan: form.keterangan.trim() || undefined,
      }

      const result = editingId
        ? await updateStokBahan({ ...payload, id: editingId })
        : await createStokBahan(payload)

      if ('error' in result && result.error) {
        setError(result.error)
        return
      }
      setIsOpen(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRestockConfirm() {
    if (restockId == null) return
    const jumlahNum = parseFloat(restockJumlah)
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      alert('Jumlah restock harus lebih dari 0')
      return
    }

    setRestockSubmitting(true)
    try {
      const result = await restockBahan(restockId, jumlahNum, restockKet || undefined)
      if ('error' in result && result.error) {
        alert(result.error)
        return
      }
      setRestockId(null)
      setRestockJumlah('0')
      setRestockKet('')
      loadData()
    } finally {
      setRestockSubmitting(false)
    }
  }

  async function openHistory(id: number) {
    setHistoryId(id)
    setHistoryLoading(true)
    try {
      const data = await getRiwayatStok(id)
      setHistory(data)
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteStokBahan(deleteId)
      if (result?.error) {
        alert(result.error)
        setDeleteId(null)
        return
      }
      setDeleteId(null)
      if (paginatedItems.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1)
      }
      loadData()
    } finally {
      setDeleting(false)
    }
  }

  async function handleResetConfirm() {
    setResetting(true)
    try {
      const result = await resetAllStokBahan()
      if (result?.error) {
        alert(result.error)
        return
      }
      setIsResetOpen(false)
      setCurrentPage(1)
      loadData()
    } finally {
      setResetting(false)
    }
  }

  const filteredItems = useMemo(() => {
    let result = items
    if (search) {
      const s = search.toLowerCase()
      result = result.filter((i) => i.namaBahan.toLowerCase().includes(s))
    }
    if (filterKategori !== 'all') {
      result = result.filter((i) => i.kategori === filterKategori)
    }
    if (filterStatus !== 'all') {
      result = result.filter((i) => i.statusStok === filterStatus)
    }
    return result
  }, [items, search, filterKategori, filterStatus])

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const countHab = useMemo(
    () => items.filter((i) => i.statusStok === 'habis').length,
    [items]
  )
  const countMenipis = useMemo(
    () => items.filter((i) => i.statusStok === 'menipis').length,
    [items]
  )
  const countTersedia = useMemo(
    () => items.filter((i) => i.statusStok === 'tersedia').length,
    [items]
  )

  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            Stok Bahan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola data inventaris bahan baku restoran dan mutasi stok
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetOpen(true)}
              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              title="Reset seluruh data bahan ke 0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset ke 0
            </Button>
          )}
          <Button onClick={() => openDialog()} size="sm" className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Tambah Bahan
          </Button>
        </div>
      </div>

      {/* Indicator / monitoring summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Card size="sm" className="py-3 px-1 gap-2 shadow-xs">
          <CardContent className="flex items-center gap-2.5 sm:gap-3 p-2">
            <div className="p-2 sm:p-2.5 rounded-lg bg-green-100 text-green-700 shrink-0">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Total Bahan</p>
              <p className="text-lg sm:text-2xl font-bold">{items.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="py-3 px-1 gap-2 shadow-xs">
          <CardContent className="flex items-center gap-2.5 sm:gap-3 p-2">
            <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Tersedia</p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-600">{countTersedia}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="py-3 px-1 gap-2 shadow-xs">
          <CardContent className="flex items-center gap-2.5 sm:gap-3 p-2">
            <div className="p-2 sm:p-2.5 rounded-lg bg-yellow-100 text-yellow-700 shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Menipis</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{countMenipis}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="py-3 px-1 gap-2 shadow-xs">
          <CardContent className="flex items-center gap-2.5 sm:gap-3 p-2">
            <div className="p-2 sm:p-2.5 rounded-lg bg-red-100 text-red-700 shrink-0">
              <PackageX className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">Habis</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{countHab}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Cari bahan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm px-3 w-full sm:w-[220px]"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterKategori} onValueChange={setFilterKategori}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-[130px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {Object.entries(kategoriLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-full sm:w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="tersedia">Tersedia</SelectItem>
              <SelectItem value="menipis">Menipis</SelectItem>
              <SelectItem value="habis">Habis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 1. Desktop Table View (hidden on mobile, visible md and up) */}
      <div className="hidden md:block bg-white rounded-lg border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="h-9 bg-gray-50/50">
                <TableHead className="h-9 w-12 text-center">No</TableHead>
                <TableHead className="h-9">Nama Bahan</TableHead>
                <TableHead className="h-9">Kategori</TableHead>
                <TableHead className="h-9">Stok Saat Ini</TableHead>
                <TableHead className="h-9">Stok Min</TableHead>
                <TableHead className="h-9">Harga/Satuan</TableHead>
                <TableHead className="h-9">Status</TableHead>
                <TableHead className="h-9 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Memuat data stok bahan...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search || filterKategori !== 'all' || filterStatus !== 'all'
                      ? 'Tidak ada bahan yang sesuai filter'
                      : 'Belum ada data stok bahan (Total: 0)'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item, index) => (
                  <TableRow key={item.id} className="h-12 hover:bg-gray-50/70 transition-colors group">
                    <TableCell className="py-2 text-center text-xs text-muted-foreground">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2.5">
                        <BahanLogo namaBahan={item.namaBahan} kategori={item.kategori} size="md" />
                        <div className="min-w-0">
                          <span className="font-medium text-sm text-foreground block truncate">
                            {item.namaBahan}
                          </span>
                          {item.keterangan && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {item.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                        {kategoriLabels[item.kategori]}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-sm font-semibold">
                      {Number(item.stokQty)} {satuanLabels[item.satuan]}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {Number(item.stokMinimum)} {satuanLabels[item.satuan]}
                    </TableCell>
                    <TableCell className="py-2 text-sm font-semibold">
                      Rp {Number(item.hargaPerSatuan).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={`${statusColors[item.statusStok]} text-[11px] border`}>
                        {statusLabels[item.statusStok]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          title="Riwayat Mutasi"
                          onClick={() => openHistory(item.id)}
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          title="Restock Bahan"
                          onClick={() => {
                            setRestockId(item.id)
                            setRestockJumlah('0')
                            setRestockKet(item.namaBahan)
                          }}
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          title="Edit Bahan"
                          onClick={() => openDialog(item)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          title="Hapus Bahan"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 2. Mobile Transposed Cards View (visible on mobile, hidden on md and up) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg border text-muted-foreground text-sm">
            Memuat data stok bahan...
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border text-muted-foreground text-sm">
            {search || filterKategori !== 'all' || filterStatus !== 'all'
              ? 'Tidak ada bahan yang sesuai filter'
              : 'Belum ada data stok bahan (Total: 0)'}
          </div>
        ) : (
          paginatedItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white border rounded-xl p-3.5 shadow-xs space-y-3 transition-all"
            >
              {/* Card Header: Logo, Name, Category, Status */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <BahanLogo namaBahan={item.namaBahan} kategori={item.kategori} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {item.namaBahan}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      {kategoriLabels[item.kategori]}
                    </span>
                  </div>
                </div>
                <Badge className={`${statusColors[item.statusStok]} text-[11px] border shrink-0`}>
                  {statusLabels[item.statusStok]}
                </Badge>
              </div>

              {/* Transposed Grid (Key-Value) */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-2.5 rounded-lg text-xs border border-gray-100">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Stok Saat Ini
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {Number(item.stokQty)} {satuanLabels[item.satuan]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Stok Minimum
                  </span>
                  <span className="font-medium text-foreground">
                    {Number(item.stokMinimum)} {satuanLabels[item.satuan]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Harga / Satuan
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    Rp {Number(item.hargaPerSatuan).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                    Keterangan
                  </span>
                  <span className="text-muted-foreground truncate block">
                    {item.keterangan || '-'}
                  </span>
                </div>
              </div>

              {/* Actions Toolbar - Mobile friendly touch buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2.5 gap-1"
                  onClick={() => openHistory(item.id)}
                >
                  <History className="w-3.5 h-3.5" />
                  Riwayat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2.5 gap-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                  onClick={() => {
                    setRestockId(item.id)
                    setRestockJumlah('0')
                    setRestockKet(item.namaBahan)
                  }}
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  Restock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2.5 gap-1"
                  onClick={() => openDialog(item)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs px-2.5 gap-1"
                  onClick={() => setDeleteId(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <BahanLogo namaBahan={form.namaBahan} kategori={form.kategori} size="lg" />
              <div>
                <DialogTitle>{editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baru'}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ikon logo akan otomatis menyesuaikan dengan nama bahan
                </p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="namaBahan">Nama Bahan Baku</Label>
              <Input
                id="namaBahan"
                placeholder="Contoh: Beras Ramos, Daging Ayam, Bawang Merah"
                value={form.namaBahan}
                onChange={(e) => setForm({ ...form, namaBahan: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={form.kategori}
                onValueChange={(value) => setForm({ ...form, kategori: value as KategoriBahan })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(kategoriLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="stokQty">Jumlah Stok Saat Ini</Label>
                <Input
                  id="stokQty"
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0"
                  value={form.stokQty}
                  onChange={(e) => setForm({ ...form, stokQty: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="satuan">Satuan</Label>
                <Select
                  value={form.satuan}
                  onValueChange={(value) => setForm({ ...form, satuan: value as SatuanStok })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(satuanLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="stokMinimum">Stok Minimum (Peringatan)</Label>
                <Input
                  id="stokMinimum"
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0"
                  value={form.stokMinimum}
                  onChange={(e) => setForm({ ...form, stokMinimum: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hargaPerSatuan">Harga Modal per Satuan (Rp)</Label>
                <Input
                  id="hargaPerSatuan"
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0"
                  value={form.hargaPerSatuan}
                  onChange={(e) => setForm({ ...form, hargaPerSatuan: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
              <Input
                id="keterangan"
                placeholder="Catatan merek atau lokasi penyimpanan..."
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-2 rounded bg-red-50 text-red-600 text-xs border border-red-200">
                {error}
              </div>
            )}

            <DialogFooter className="pt-3 flex flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Bahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockId != null} onOpenChange={(open) => { if (!open) setRestockId(null) }}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <BahanLogo namaBahan={restockKet} size="md" />
              <DialogTitle>Restock Bahan Baku</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border">
              Menambahkan stok untuk: <strong className="text-foreground">{restockKet}</strong>
            </p>
            <div className="grid gap-2">
              <Label htmlFor="restockJumlah">Jumlah Penambahan Stok</Label>
              <Input
                id="restockJumlah"
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={restockJumlah}
                onChange={(e) => setRestockJumlah(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="restockKet">Keterangan Restock (Opsional)</Label>
              <Input
                id="restockKet"
                placeholder="Misal: Pembelian pasar mingguan, Supplier A"
                value={restockKet}
                onChange={(e) => setRestockKet(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRestockId(null)}>
              Batal
            </Button>
            <Button
              onClick={handleRestockConfirm}
              disabled={restockSubmitting || parseFloat(restockJumlah) <= 0}
            >
              {restockSubmitting ? 'Menyimpan...' : 'Konfirmasi Restock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyId != null} onOpenChange={(open) => { if (!open) setHistoryId(null) }}>
        <DialogContent className="max-w-lg w-[95vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {history.length > 0 && <BahanLogo namaBahan={history[0].namaBahan} size="sm" />}
              <DialogTitle>
                Riwayat Mutasi Stok {history.length > 0 ? `(${history[0].namaBahan})` : ''}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-2 max-h-[60vh] overflow-auto">
            {historyLoading ? (
              <p className="text-center text-xs text-muted-foreground py-6">Memuat riwayat...</p>
            ) : history.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">Belum ada riwayat mutasi</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="h-9 bg-gray-50/50">
                    <TableHead className="h-9 text-xs">Waktu</TableHead>
                    <TableHead className="h-9 text-xs">Jenis</TableHead>
                    <TableHead className="h-9 text-xs">Perubahan</TableHead>
                    <TableHead className="h-9 text-xs">Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id} className="h-10 text-xs">
                      <TableCell className="py-1 text-xs text-muted-foreground">{h.createdAt}</TableCell>
                      <TableCell className="py-1">
                        <Badge variant="outline" className="text-[10px]">
                          {jenisPerubahanLabels[h.jenisPerubahan]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 font-mono text-xs">
                        {Number(h.stokSebelum)} → {Number(h.stokSesudah)}
                      </TableCell>
                      <TableCell className="py-1 text-xs text-muted-foreground">
                        {h.userName || 'Sistem'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryId(null)} className="h-8 text-xs">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Bahan</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus bahan ini? Data bahan tidak akan lagi muncul di inventaris aktif.
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Menghapus...' : 'Hapus Bahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Reset Seluruh Data Bahan (ke 0)</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-2 text-sm text-muted-foreground">
            <p>
              Tindakan ini akan mengosongkan semua data bahan aktif sehingga total bahan menjadi <strong>0</strong>.
            </p>
            <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
              Gunakan fitur ini jika Anda ingin memulai simulasi / pengujian CRUD dari kondisi bersih (mulai dari 0).
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsResetOpen(false)} disabled={resetting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleResetConfirm} disabled={resetting}>
              {resetting ? 'Mereset...' : 'Ya, Reset ke 0'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
