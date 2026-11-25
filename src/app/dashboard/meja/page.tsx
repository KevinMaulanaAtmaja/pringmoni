"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TableBodySkeleton } from "@/components/ui/page-skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, QrCode, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, Tags, Printer, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { QRCodeSVG } from "qrcode.react"
import { getMeja, getNextNomorMeja, createMeja, updateMeja, deleteMeja, kosongkanMeja } from "@/app/actions/meja"
import { getTipeMejas, createTipeMeja, updateTipeMeja, deleteTipeMeja } from "@/app/actions/tipe-meja"
import { useUserRole } from "@/lib/user-context"
import type { TipeMeja, Meja } from "@/types"
/* tipe dinamis menggantikan TipeMeja hardcode */

const statusColors: Record<string, string> = {
  kosong: "bg-green-100 text-green-800",
  terpakai: "bg-red-100 text-red-800",
  dipesan: "bg-amber-100 text-amber-800",
}

const statusLabels: Record<string, string> = {
  kosong: "Kosong",
  terpakai: "Terpakai",
  dipesan: "Dipesan",
}

const ITEMS_PER_PAGE = 5

export default function MejaPage() {
  const userRole = useUserRole()
  const isOwner = userRole === 'owner'
  const canKosongkan = userRole === 'owner' || userRole === 'cashier' || userRole === 'waiter'
  const showAksi = isOwner || canKosongkan
  const [mejas, setMejas] = useState<Meja[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isQROpen, setIsQROpen] = useState(false)
  const [selectedMeja, setSelectedMeja] = useState<Meja | null>(null)
  const [editingMeja, setEditingMeja] = useState<Meja | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [nextNomorMeja, setNextNomorMeja] = useState<string>("")
  const [kapasitas, setKapasitas] = useState<string>("")
  const [tipeMejaId, setTipeMejaId] = useState<string>("")
  const [tipeMejas, setTipes] = useState<TipeMeja[]>([])
  const [error, setError] = useState<string | null>(null)

  const [isTipeOpen, setIsTipeOpen] = useState(false)
  const [editingTipe, setEditingTipe] = useState<TipeMeja | null>(null)
  const [tipeForm, setTipeForm] = useState({
    namaTipe: "",
    khususSatuCustomer: false,
    modeBebas: false,
    tokenTipeAlias: "",
  })
  const [deleteTipe, setDeleteTipe] = useState<TipeMeja | null>(null)

  // Delete confirmation states
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Empty (kosongkan) confirmation states
  const [emptyMeja, setEmptyMeja] = useState<Meja | null>(null)
  const [emptying, setEmptying] = useState(false)

  // Filter states
  const [search, setSearch] = useState("")
  const [filterTipe, setFilterTipe] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const loadData = async () => {
    setLoading(true)
    try {
      const [result, tipeResult] = await Promise.all([getMeja(), getTipeMejas()])
      if ('error' in result) {
        setError(result.error as string)
        return
      }
      setMejas(result as unknown as Meja[])
      if (!('error' in tipeResult)) setTipes(tipeResult)
    } catch {
      setError("Gagal memuat data meja")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterTipe, filterStatus])

  const loadNextNomorMeja = async (tipeId: string) => {
    if (!tipeId) {
      setNextNomorMeja("")
      return
    }
    try {
      const result = await getNextNomorMeja(parseInt(tipeId))
      setNextNomorMeja(result as string)
    } catch {
      setNextNomorMeja("")
    }
  }

  // Filter logic
  const filteredMejas = useMemo(() => {
    let result = mejas

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(m =>
        m.nomorMeja.toLowerCase().includes(s)
      )
    }

    if (filterTipe !== "all") {
      result = result.filter(m =>
        filterTipe === "tanpa"
          ? !m.tipeMejaId
          : String(m.tipeMejaId) === filterTipe
      )
    }

    if (filterStatus !== "all") {
      result = result.filter(m => m.statusMeja === filterStatus)
    }

    return result
  }, [mejas, search, filterTipe, filterStatus])

  // Pagination
  const totalPages = Math.ceil(filteredMejas.length / ITEMS_PER_PAGE)
  const paginatedMejas = filteredMejas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const openDialog = (meja?: Meja) => {
    if (meja) {
      setEditingMeja(meja)
      setNextNomorMeja(meja.nomorMeja)
      setKapasitas(meja.kapasitas.toString())
      setTipeMejaId(meja.tipeMejaId ? String(meja.tipeMejaId) : "")
    } else {
      setEditingMeja(null)
      setNextNomorMeja("")
      setKapasitas("")
      setTipeMejaId("")
    }
    setIsOpen(true)
  }

  const handleTipeChange = (value: string) => {
    const normalized = value === "tanpa" ? "" : value
    setTipeMejaId(normalized)
    if (!editingMeja) loadNextNomorMeja(normalized)
  }

  const openTipeDialog = (tipe?: TipeMeja) => {
    const modeBebas = tipe?.modeBebas ?? false
    setEditingTipe(tipe ?? null)
    setTipeForm({
      namaTipe: tipe?.namaTipe ?? "Kursi",
      khususSatuCustomer: !modeBebas,
      modeBebas,
      tokenTipeAlias: modeBebas ? tipe?.tokenTipeAlias ?? "" : "",
    })
    setIsTipeOpen(true)
  }

  const handleTipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("namaTipe", tipeForm.namaTipe)
      formData.set("khususSatuCustomer", String(tipeForm.khususSatuCustomer))
      formData.set("modeBebas", String(tipeForm.modeBebas))
      formData.set("tokenTipeAlias", tipeForm.modeBebas ? tipeForm.tokenTipeAlias : "")

      const result = editingTipe
        ? await updateTipeMeja(editingTipe.id, formData)
        : await createTipeMeja(null, formData)
      if ('error' in result && result.error) {
        alert(result.error)
        return
      }
      setIsTipeOpen(false)
      setEditingTipe(null)
      await loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteTipeConfirm() {
    if (!deleteTipe) return
    const result = await deleteTipeMeja(deleteTipe.id)
    if ('error' in result && result.error) {
      alert(result.error)
      setDeleteTipe(null)
      return
    }
    setDeleteTipe(null)
    await loadData()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

      try {
        const formData = new FormData()
        formData.set("kapasitas", kapasitas)
        formData.set("tipeMejaId", tipeMejaId)

        if (editingMeja) {
          const result = await updateMeja(editingMeja.id, formData)
          if ('error' in result && result.error) {
            alert(result.error)
            return
          }
        } else {
          const result = await createMeja(null, formData)
          if ('error' in result && result.error) {
            alert(result.error)
            return
          }
        }

        setNextNomorMeja("")
        setKapasitas("")
        setTipeMejaId("")
        setEditingMeja(null)
        setIsOpen(false)
        loadData()
      } finally {
        setSubmitting(false)
      }
  }

  function handleDeleteClick(id: number) {
    setDeleteId(id)
  }

  async function handleDeleteConfirm() {
    if (deleteId) {
      const result = await deleteMeja(deleteId)
      if ('error' in result && result.error) {
        alert(result.error)
        setDeleteId(null)
        return
      }
      setDeleteId(null)
      loadData()
    }
  }

  function handleDeleteCancel() {
    setDeleteId(null)
  }

  function handleKosongkanClick(meja: Meja) {
    setEmptyMeja(meja)
  }

  async function handleKosongkanConfirm() {
    if (!emptyMeja) return
    setEmptying(true)
    try {
      const result = await kosongkanMeja(emptyMeja.id)
      if ('error' in result && result.error) {
        alert(result.error)
        return
      }
      setEmptyMeja(null)
      loadData()
    } catch {
      alert("Terjadi kesalahan saat mengosongkan meja")
    } finally {
      setEmptying(false)
    }
  }

  function handleKosongkanCancel() {
    setEmptyMeja(null)
  }

  const openQR = (meja: Meja) => {
    setSelectedMeja(meja)
    setIsQROpen(true)
  }

  const downloadQR = (meja: Meja | null) => {
    if (!meja?.tokenMeja) return

    const svgElement = document.getElementById('qr-code-svg')
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height + 30
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      ctx.fillStyle = '#000000'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(meja.nomorMeja, canvas.width / 2, canvas.height - 10)

      const link = document.createElement('a')
      link.download = `QR-${meja.nomorMeja}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Kelola Meja</h1>
      </div>

      {/* Filters + Tambah Button */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-[200px] text-sm px-3"
        />
        <Select value={filterTipe} onValueChange={setFilterTipe}>
          <SelectTrigger className="h-8 w-[150px] text-sm">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="tanpa">Tanpa tipe</SelectItem>
            {tipeMejas.map((k) => (
              <SelectItem key={k.id} value={String(k.id)}>{k.namaTipe}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="kosong">Kosong</SelectItem>
            <SelectItem value="terpakai">Terpakai</SelectItem>
            <SelectItem value="dipesan">Dipesan</SelectItem>
          </SelectContent>
        </Select>
        {isOwner && (
          <div className="ml-auto flex gap-2">
            <Button onClick={() => openTipeDialog()} variant="outline" className="h-8">
              <Tags className="w-4 h-4 mr-2" />
              Tipe
            </Button>
            <Button onClick={() => openDialog()} className="h-8">
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-9">
              <TableHead className="h-9">No</TableHead>
              <TableHead className="h-9">Nomor</TableHead>
              <TableHead className="h-9">Tipe</TableHead>
              <TableHead className="h-9">Kapasitas</TableHead>
              <TableHead className="h-9">QR</TableHead>
              <TableHead className="h-9">Status</TableHead>
              {showAksi && <TableHead className="h-9 text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableBodySkeleton columns={showAksi ? 7 : 6} rows={6} />
            ) : paginatedMejas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showAksi ? 7 : 6} className="text-center py-4">
                  {search || filterTipe !== "all" || filterStatus !== "all"
                    ? "Tidak ada meja yang sesuai filter"
                    : "Belum ada meja"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMejas.map((meja, index) => (
                <TableRow key={meja.id} className="h-12">
                  <TableCell className="py-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="font-medium py-2">{meja.nomorMeja}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline" className="text-xs">
                      {meja.namaTipe || meja.tipeMeja || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">{meja.kapasitas} org</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1">
                      {meja.tokenMeja ? (
                        <>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => openQR(meja)}>
                            <QrCode className="w-3 h-3 mr-1" />
                            QR
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`${statusColors[meja.statusMeja]} text-xs`}>
                      {statusLabels[meja.statusMeja]}
                    </Badge>
                  </TableCell>
{showAksi && (
                    <TableCell className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {canKosongkan && (meja.statusMeja === 'terpakai' || meja.statusMeja === 'dipesan') && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            title="Kosongkan meja"
                            onClick={() => handleKosongkanClick(meja)}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                        {isOwner && (
                          <>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openDialog(meja)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(meja.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}

      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="qr-print-dialog max-w-md gap-4 p-5">
          <DialogHeader className="qr-no-print">
            <DialogTitle>QR Meja {selectedMeja?.nomorMeja}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Cetak kartu ini dan letakkan di meja agar tamu bisa memesan langsung.
            </p>
          </DialogHeader>

          <div className="qr-print-card rounded-2xl border border-emerald-200 bg-white p-5 text-center text-foreground shadow-sm">
            <div className="qr-no-print mb-3 flex justify-center">
              <Badge className={`${statusColors[selectedMeja?.statusMeja || "kosong"]} text-xs`}>
                {statusLabels[selectedMeja?.statusMeja || "kosong"]}
              </Badge>
            </div>

            <div className="border-b border-dashed border-border pb-3">
              <p className="font-heading text-sm font-semibold tracking-[0.18em] text-emerald-700">
                PRINGMONI
              </p>
              <p className="text-[10px] tracking-wide text-muted-foreground">Restoran Pringsewu</p>
            </div>

            <div className="py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Meja</p>
              <p className="font-heading text-3xl font-bold tracking-tight">
                {selectedMeja?.nomorMeja}
              </p>
            </div>

            {selectedMeja?.tokenMeja && (
              <div className="inline-flex rounded-xl border border-border bg-white p-3">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`${window.location.origin}/${selectedMeja.tokenMeja}`}
                  size={196}
                  level="H"
                  includeMargin
                />
              </div>
            )}

            <p className="mt-4 font-heading text-sm font-semibold">Scan untuk lihat menu & pesan</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Tidak perlu login — pesanan langsung dikirim ke meja ini.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 border-t border-dashed border-border pt-3 text-[11px] text-muted-foreground">
              <span>{selectedMeja?.namaTipe || selectedMeja?.tipeMeja || "-"}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedMeja?.kapasitas} orang</span>
            </div>
          </div>

          {selectedMeja?.tokenMeja && (
            <p className="qr-no-print -mt-2 text-center text-[10px] text-muted-foreground">
              Token: <span className="font-mono">{selectedMeja.tokenMeja}</span>
            </p>
          )}

          {selectedMeja?.reservasiAktif ? (
            <div className="qr-no-print text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-800 text-left">
              <p className="font-semibold">Reservasi aktif: {selectedMeja.reservasiAktif.kodeReservasi}</p>
              <p>
                {selectedMeja.reservasiAktif.namaPelanggan} — {selectedMeja.reservasiAktif.jumlahOrang} orang
              </p>
              <p>Kedatangan: {new Date(selectedMeja.reservasiAktif.waktuKedatangan).toLocaleString("id-ID")}</p>
            </div>
          ) : null}

          <DialogFooter className="qr-no-print grid grid-cols-2 gap-2 sm:flex sm:justify-center">
            <Button variant="outline" size="sm" onClick={() => downloadQR(selectedMeja)}>
              <Download className="w-4 h-4 mr-2" />
              Unduh PNG
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMeja ? "Edit Meja" : "Tambah Meja Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2 py-2">
              <div className="grid gap-1">
                <Label htmlFor="tipeMeja" className="text-xs">Tipe Meja</Label>
                <Select value={tipeMejaId || "tanpa"} onValueChange={handleTipeChange} disabled={!isOwner}>
                  <SelectTrigger id="tipeMeja" className="h-7 text-xs">
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tanpa" disabled>Wajib pilih tipe</SelectItem>
                    {tipeMejas.map((k) => (
                      <SelectItem key={k.id} value={String(k.id)}>
                        {k.namaTipe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!editingMeja && (
                <div className="grid gap-1">
                  <Label className="text-xs">Nomor (Otomatis)</Label>
                  <div className="p-1 bg-gray-100 rounded border text-center text-xs font-medium">
                    {nextNomorMeja || "Pilih tipe"}
                  </div>
                </div>
              )}

              <div className="grid gap-1">
                <Label htmlFor="kapasitas" className="text-xs">Kapasitas</Label>
                <Input
                  id="kapasitas"
                  type="number"
                  min="1"
                  max="20"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(e.target.value)}
                  placeholder="Jumlah"
                  className="h-7 text-xs"
                  required
                />
              </div>

              {editingMeja && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-700">
                  Nomor meja tidak berubah saat tipe diubah. Tipe hanya menentukan prefix nomor untuk meja baru.
                </div>
              )}

              {!editingMeja && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
                  <p className="font-medium">Info</p>
                  <p>Token & QR Code akan dibuat otomatis saat meja disimpan.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  setNextNomorMeja("")
                  setKapasitas("")
                  setTipeMejaId("")
                  setEditingMeja(null)
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting || !tipeMejaId}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Kelola Tipe Meja */}
      <Dialog open={isTipeOpen} onOpenChange={setIsTipeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kelola Tipe Meja</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Tipe menentukan cara meja dipakai. Token & nomor meja dibuat otomatis.
            </p>
          </DialogHeader>

          <div className="max-h-48 overflow-y-auto space-y-2 my-3">
            {tipeMejas.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">
                Belum ada tipe
              </p>
            ) : (
              tipeMejas.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{k.namaTipe}</span>
                    <Badge
                      className={`text-[10px] shrink-0 ${
                        k.modeBebas
                          ? "bg-emerald-100 text-emerald-800"
                          : k.khususSatuCustomer
                            ? "bg-amber-100 text-amber-800"
                            : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {k.modeBebas ? "Bebas (tanpa QR)" : k.khususSatuCustomer ? "Meja QR" : "Bersamaan"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground shrink-0">{k.jumlahMeja ?? 0} meja</span>
                    {k.modeBebas && (
                      <span className="text-[10px] font-mono text-emerald-700 shrink-0">
                        {k.tokenTipeAlias ?? k.tokenTipe}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openTipeDialog(k)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      onClick={() => setDeleteTipe(k)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleTipeSubmit}>
            <div className="grid gap-2 py-2 border-t pt-3">
              <Label htmlFor="namaTipe" className="text-xs">
                {editingTipe ? "Edit Tipe" : "Tambah Tipe Baru"}
              </Label>
              <Input
                id="namaTipe"
                value={tipeForm.namaTipe}
                onChange={(e) => setTipeForm((prev) => ({ ...prev, namaTipe: e.target.value }))}
                placeholder="Contoh: Kursi, Lesehan, Camping"
                className="h-8 text-xs"
                required
              />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={tipeForm.khususSatuCustomer}
                    onCheckedChange={(v) => {
                      if (v !== true) return
                      setTipeForm((prev) => ({
                        ...prev,
                        khususSatuCustomer: true,
                        modeBebas: false,
                        tokenTipeAlias: "",
                      }))
                    }}
                  />
                  Meja QR — 1 meja 1 rombongan
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={tipeForm.modeBebas}
                    onCheckedChange={(v) => {
                      if (v !== true) return
                      setTipeForm((prev) => ({ ...prev, modeBebas: true, khususSatuCustomer: false }))
                    }}
                  />
                  Meja Bebas — meja tanpa QR
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Sistem yang memilihkan meja kosong. Cukup 1 tipe Bebas.
                </p>
              </div>
              {tipeForm.modeBebas && (
                <div className="space-y-1 pt-1">
                  <Label htmlFor="tokenTipeAlias" className="text-xs">
                    Token khusus (opsional)
                  </Label>
                  <Input
                    id="tokenTipeAlias"
                    value={tipeForm.tokenTipeAlias}
                    onChange={(e) =>
                      setTipeForm((prev) => ({ ...prev, tokenTipeAlias: e.target.value }))
                    }
                    placeholder="Mis. BEBAS12"
                    className="h-8 text-xs font-mono uppercase"
                    maxLength={24}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Untuk QR/link Meja Bebas. Kosongkan = token otomatis.
                  </p>
                </div>
              )}
              <Button type="submit" disabled={submitting} className="h-8">
                {submitting
                  ? "..."
                  : editingTipe
                    ? "Update"
                    : "Tambah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Meja</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus meja ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel} className="h-7 text-xs">
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="h-7 text-xs"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kosongkan Meja Confirmation Dialog */}
      <Dialog open={emptyMeja !== null} onOpenChange={() => handleKosongkanCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Kosongkan Meja</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin mengosongkan meja <strong>{emptyMeja?.nomorMeja}</strong>?
            </p>
            <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Peringatan: pesanan yang belum dibayar di meja ini akan{" "}
                <strong>dibatalkan permanen</strong> dan tidak dapat dikembalikan.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleKosongkanCancel} className="h-7 text-xs" disabled={emptying}>
              Batal
            </Button>
            <Button
              variant="default"
              onClick={handleKosongkanConfirm}
              className="h-7 text-xs"
              disabled={emptying}
            >
              {emptying ? "Mengosongkan..." : "Kosongkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTipe !== null} onOpenChange={() => setDeleteTipe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Tipe</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Hapus tipe <strong>{deleteTipe?.namaTipe}</strong>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTipe(null)} className="h-7 text-xs">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteTipeConfirm} className="h-7 text-xs">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
