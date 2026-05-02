"use client"

import { useState } from "react"
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
import { Plus, Pencil, Trash2, QrCode } from "lucide-react"

const mockMejas = [
  { id: 1, nomorMeja: 'A1', kapasitas: 4, tokenMeja: 'ABC123', statusMeja: 'kosong' },
  { id: 2, nomorMeja: 'B2', kapasitas: 2, tokenMeja: 'DEF456', statusMeja: 'terpakai' },
  { id: 3, nomorMeja: 'C3', kapasitas: 6, tokenMeja: 'GHI789', statusMeja: 'kosong' },
]

const statusColors: Record<string, string> = {
  kosong: "bg-green-100 text-green-800",
  terpakai: "bg-red-100 text-red-800",
}

export default function MejaPage() {
  const [mejas] = useState(mockMejas)
  const [isOpen, setIsOpen] = useState(false)
  const [isQROpen, setIsQROpen] = useState(false)
  const [selectedMeja, setSelectedMeja] = useState<(typeof mockMejas)[0] | null>(null)

  function openQR(meja: (typeof mockMejas)[0]) {
    setSelectedMeja(meja)
    setIsQROpen(true)
  }

  function handleDelete(id: number) {
    alert(`Simulasi: Meja #${id} dihapus`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Meja</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Tambah Meja
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nomor Meja</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mejas.map((meja, index) => (
              <TableRow key={meja.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{meja.nomorMeja}</TableCell>
                <TableCell>{meja.kapasitas} orang</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => openQR(meja)}>
                    <QrCode className="w-4 h-4 mr-2" />Lihat QR
                  </Button>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[meja.statusMeja]}>
                    {meja.statusMeja === 'kosong' ? 'Kosong' : 'Terpakai'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(meja.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QR Code - Meja {selectedMeja?.nomorMeja}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="inline-block bg-white p-4 rounded-lg border">
              <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center mx-auto">
                <p className="text-sm text-gray-500">QR Code: {selectedMeja?.tokenMeja}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Simulasi QR Code (qrcode.react belum diinstall)</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Meja Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nomorMeja">Nomor Meja</Label>
              <Input id="nomorMeja" placeholder="Contoh: A1" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kapasitas">Kapasitas</Label>
              <Input id="kapasitas" type="number" placeholder="Jumlah kursi" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
            <Button onClick={() => { alert('Simulasi: Meja ditambahkan'); setIsOpen(false) }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
