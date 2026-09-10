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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, QrCode, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QRCodeSVG } from "qrcode.react"
import { getMeja, getNextNomorMeja, createMeja, updateMeja, deleteMeja, kosongkanMeja } from "@/app/actions/meja"
import type { Meja } from "@/types"
import { TipeMeja } from "@/types"

const statusColors: Record<string, string> = {
  kosong: "bg-green-100 text-green-800",
  terpakai: "bg-red-100 text-red-800",
}

const statusLabels: Record<string, string> = {
  kosong: "Kosong",
  terpakai: "Terpakai",
}

const tipeMejaLabels: Record<string, string> = {
  lesehan: "Lesehan",
  kursi: "Kursi",
}

const ITEMS_PER_PAGE = 5

export default function MejaPage() {
  const [mejas, setMejas] = useState<Meja[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isQROpen, setIsQROpen] = useState(false)
  const [selectedMeja, setSelectedMeja] = useState<Meja | null>(null)
  const [editingMeja, setEditingMeja] = useState<Meja | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tipeMeja, setTipeMeja] = useState<string>("")
  const [nextNomorMeja, setNextNomorMeja] = useState<string>("")
  const [kapasitas, setKapasitas] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

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
      const result = await getMeja()
      if ('error' in result) {
        setError(result.error as string)
      } else {
        setMejas(result as unknown as Meja[])
      }
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

  const loadNextNomorMeja = async (tipe: string) => {
    if (!tipe) {
      setNextNomorMeja("")
      return
    }
    try {
      const result = await getNextNomorMeja(tipe as TipeMeja)
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
      result = result.filter(m => m.tipeMeja === filterTipe)
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
      setTipeMeja("")
      setNextNomorMeja(meja.nomorMeja)
      setKapasitas(meja.kapasitas.toString())
    } else {
      setEditingMeja(null)
      setTipeMeja("")
      setNextNomorMeja("")
      setKapasitas("")
    }
    setIsOpen(true)
  }

  const handleTipeMejaChange = (value: string) => {
    setTipeMeja(value)
    loadNextNomorMeja(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

      try {
        const formData = new FormData()
        formData.set("kapasitas", kapasitas)

        if (editingMeja) {
          const result = await updateMeja(editingMeja.id, formData)
          if ('error' in result && result.error) {
            alert(result.error)
            return
          }
        } else {
          formData.set("tipeMeja", tipeMeja)
          const result = await createMeja(null, formData)
          if ('error' in result && result.error) {
            alert(result.error)
            return
          }
        }

        setTipeMeja("")
        setNextNomorMeja("")
        setKapasitas("")
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
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="lesehan">Lesehan</SelectItem>
            <SelectItem value="kursi">Kursi</SelectItem>
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
          </SelectContent>
        </Select>
        <Button onClick={() => openDialog()} className="h-8 ml-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
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
              <TableHead className="h-9 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative h-5 w-5">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedMejas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
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
                      {tipeMejaLabels[meja.tipeMeja] || meja.tipeMeja}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">{meja.kapasitas} org</TableCell>
                  <TableCell className="py-2">
                    {meja.tokenMeja ? (
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => openQR(meja)}>
                        <QrCode className="w-3 h-3 mr-1" />
                        QR
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge className={`${statusColors[meja.statusMeja]} text-xs`}>
                      {statusLabels[meja.statusMeja]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      {meja.statusMeja === 'terpakai' && (
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
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openDialog(meja)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(meja.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
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
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QR Code - Meja {selectedMeja?.nomorMeja}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="inline-block bg-gray-100 p-3 rounded">
              {selectedMeja?.tokenMeja && (
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`${window.location.origin}/${selectedMeja.tokenMeja}`}
                  size={200}
                  level="H"
                  includeMargin
                />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Scan QR ini untuk mengakses menu
            </p>
          </div>

          <DialogFooter className="justify-center">
            <Button onClick={() => downloadQR(selectedMeja)}>
              Download QR
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
              {!editingMeja && (
                <>
                  <div className="grid gap-1">
                    <Label htmlFor="tipeMeja" className="text-xs">Tipe Meja</Label>
                    <Select value={tipeMeja} onValueChange={handleTipeMejaChange}>
                      <SelectTrigger id="tipeMeja" className="h-7 text-xs">
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesehan">Lesehan (L)</SelectItem>
                        <SelectItem value="kursi">Kursi (K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tipeMeja && (
                    <div className="grid gap-1">
                      <Label className="text-xs">Nomor (Otomatis)</Label>
                      <div className="p-1 bg-gray-100 rounded border text-center text-xs font-medium">
                        {nextNomorMeja || "Pilih tipe"}
                      </div>
                    </div>
                  )}
                </>
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
                  setTipeMeja("")
                  setNextNomorMeja("")
                  setKapasitas("")
                  setEditingMeja(null)
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting || (!editingMeja && !tipeMeja)}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
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
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin mengosongkan meja <strong>{emptyMeja?.nomorMeja}</strong>?
            </p>
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
    </div>
  )
}
