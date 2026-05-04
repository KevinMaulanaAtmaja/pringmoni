"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { getPesananForDashboard, getMeja } from "@/app/actions/pesanan"
import { getMeja as getMejaList } from "@/app/actions/meja"
import type { Meja } from "@/types"
import { Eye, Filter, RotateCcw } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  diproses: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

const statusBayarColors: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  berhasil: "bg-green-100 text-green-800",
  dibatalkan: "bg-red-100 text-red-800",
}

export default function PesananPage() {
  const [pesanan, setPesanan] = useState<any[]>([])
  const [mejas, setMejas] = useState<Meja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterTanggal, setFilterTanggal] = useState<string>("")
  const [filterMejaId, setFilterMejaId] = useState<string>("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pesananResult, mejaResult] = await Promise.all([
        getPesananForDashboard({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          tanggal: filterTanggal || undefined,
          mejaId: filterMejaId ? parseInt(filterMejaId) : undefined,
        }),
        getMejaList()
      ])

      if ('error' in pesananResult) {
        setError(pesananResult.error as string)
      } else {
        setPesanan(pesananResult as any[])
      }

      if (!('error' in mejaResult)) {
        setMejas(mejaResult as Meja[])
      }
    } catch {
      setError("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterStatus, filterTanggal, filterMejaId])

  const resetFilter = () => {
    setFilterStatus("all")
    setFilterTanggal("")
    setFilterMejaId("")
  }

  if (loading) return <div className="p-8 text-center">Memuat...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Pesanan</h1>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label>Status Pesanan</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tanggal</Label>
              <Input 
                type="date" 
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Meja</Label>
              <Select value={filterMejaId} onValueChange={setFilterMejaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Meja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Meja</SelectItem>
                  {mejas.map((meja) => (
                    <SelectItem key={meja.id} value={meja.id.toString()}>
                      {meja.nomorMeja} ({meja.tipeMeja === 'lesehan' ? 'L' : 'K'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={resetFilter} variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Meja</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Status Bayar</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pesanan.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Tidak ada pesanan
                </TableCell>
              </TableRow>
            ) : (
              pesanan.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">#{p.id}</TableCell>
                  <TableCell>{p.meja}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {p.tipeMeja === 'lesehan' ? 'Lesehan' : 'Kursi'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[p.status]}>
                      {p.status === 'menunggu' ? 'Menunggu' : 
                       p.status === 'diproses' ? 'Diproses' :
                       p.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBayarColors[p.statusBayar]}>
                      {p.statusBayar === 'menunggu' ? 'Menunggu' : 
                       p.statusBayar === 'berhasil' ? 'Berhasil' : 'Dibatalkan'}
                    </Badge>
                  </TableCell>
                  <TableCell>Rp {p.total.toLocaleString("id-ID")}</TableCell>
                  <TableCell>{p.items} item</TableCell>
                  <TableCell>
                    {new Date(p.waktu).toLocaleString("id-ID", {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/pesanan/${p.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
