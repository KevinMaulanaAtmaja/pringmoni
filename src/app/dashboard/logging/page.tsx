'use client'

import { useState, useMemo, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

type JenisAksi =
  | 'LOGIN' | 'LOGOUT'
  | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER'
  | 'CREATE_MENU' | 'UPDATE_MENU' | 'DELETE_MENU'
  | 'CREATE_MEJA' | 'UPDATE_MEJA' | 'DELETE_MEJA'
  | 'CREATE_ORDER' | 'UPDATE_ORDER_STATUS' | 'CANCEL_ORDER'
  | 'PROCESS_PAYMENT'

interface LogItem {
  id: number
  userId: number | null
  userName: string
  aksi: JenisAksi
  keterangan: string
  ipAddress: string
  createdAt: string
}

const mockLogs: LogItem[] = [
  { id: 1, userId: 1, userName: 'Admin', aksi: 'LOGIN', keterangan: 'Admin login ke sistem', ipAddress: '192.168.1.100', createdAt: '2026-05-17 08:00:00' },
  { id: 2, userId: 1, userName: 'Admin', aksi: 'CREATE_USER', keterangan: 'Menambah user kasir: Siti', ipAddress: '192.168.1.100', createdAt: '2026-05-17 08:15:00' },
  { id: 3, userId: 2, userName: 'Siti', aksi: 'LOGIN', keterangan: 'Siti login ke sistem', ipAddress: '192.168.1.101', createdAt: '2026-05-17 08:30:00' },
  { id: 4, userId: 1, userName: 'Admin', aksi: 'CREATE_MENU', keterangan: 'Menambah menu: Nasi Goreng Spesial Rp25,000', ipAddress: '192.168.1.100', createdAt: '2026-05-17 09:00:00' },
  { id: 5, userId: 1, userName: 'Admin', aksi: 'CREATE_MENU', keterangan: 'Menambah menu: Es Teh Manis Rp5,000', ipAddress: '192.168.1.100', createdAt: '2026-05-17 09:05:00' },
  { id: 6, userId: 1, userName: 'Admin', aksi: 'UPDATE_MENU', keterangan: 'Update menu: Nasi Goreng spesial → Rp27,000', ipAddress: '192.168.1.100', createdAt: '2026-05-17 09:30:00' },
  { id: 7, userId: 1, userName: 'Admin', aksi: 'CREATE_MEJA', keterangan: 'Menambah meja: Meja 6 (lesehan, 4 kursi)', ipAddress: '192.168.1.100', createdAt: '2026-05-17 10:00:00' },
  { id: 8, userId: 3, userName: 'Budi', aksi: 'LOGIN', keterangan: 'Budi (waiter) login ke sistem', ipAddress: '192.168.1.102', createdAt: '2026-05-17 10:15:00' },
  { id: 9, userId: 3, userName: 'Budi', aksi: 'CREATE_ORDER', keterangan: 'Pesanan baru dari Meja 3: Nasi Goreng x2, Es Teh x1', ipAddress: '192.168.1.102', createdAt: '2026-05-17 10:30:00' },
  { id: 10, userId: 3, userName: 'Budi', aksi: 'UPDATE_ORDER_STATUS', keterangan: 'Pesanan #001 disiapkan', ipAddress: '192.168.1.102', createdAt: '2026-05-17 10:35:00' },
  { id: 11, userId: 2, userName: 'Siti', aksi: 'PROCESS_PAYMENT', keterangan: 'Pembayaran pesanan #001: Rp65,000 (Tunai)', ipAddress: '192.168.1.101', createdAt: '2026-05-17 11:00:00' },
  { id: 12, userId: 1, userName: 'Admin', aksi: 'UPDATE_MEJA', keterangan: 'Update meja: Meja 3 → status terpakai', ipAddress: '192.168.1.100', createdAt: '2026-05-17 11:15:00' },
  { id: 13, userId: 3, userName: 'Budi', aksi: 'CREATE_ORDER', keterangan: 'Pesanan baru dari Meja 5: Mie Goreng x1, Es Jeruk x2', ipAddress: '192.168.1.102', createdAt: '2026-05-17 12:00:00' },
  { id: 14, userId: 3, userName: 'Budi', aksi: 'CANCEL_ORDER', keterangan: 'Pesanan #003 dibatalkan: pelanggan batal order', ipAddress: '192.168.1.102', createdAt: '2026-05-17 12:10:00' },
  { id: 15, userId: 2, userName: 'Siti', aksi: 'PROCESS_PAYMENT', keterangan: 'Pembayaran pesanan #002: Rp45,000 (QRIS)', ipAddress: '192.168.1.101', createdAt: '2026-05-17 12:30:00' },
  { id: 16, userId: 1, userName: 'Admin', aksi: 'DELETE_MENU', keterangan: 'Menghapus menu: Es Teh Manis', ipAddress: '192.168.1.100', createdAt: '2026-05-17 13:00:00' },
  { id: 17, userId: 1, userName: 'Admin', aksi: 'UPDATE_USER', keterangan: 'Update user: Siti → role cashier', ipAddress: '192.168.1.100', createdAt: '2026-05-17 13:30:00' },
  { id: 18, userId: 3, userName: 'Budi', aksi: 'UPDATE_ORDER_STATUS', keterangan: 'Pesanan #004 selesai', ipAddress: '192.168.1.102', createdAt: '2026-05-17 14:00:00' },
  { id: 19, userId: 2, userName: 'Siti', aksi: 'LOGOUT', keterangan: 'Siti logout dari sistem', ipAddress: '192.168.1.101', createdAt: '2026-05-17 14:30:00' },
  { id: 20, userId: 1, userName: 'Admin', aksi: 'CREATE_MEJA', keterangan: 'Menambah meja: Meja 7 (kursi, 6 kursi)', ipAddress: '192.168.1.100', createdAt: '2026-05-17 15:00:00' },
  { id: 21, userId: 1, userName: 'Admin', aksi: 'DELETE_MEJA', keterangan: 'Menghapus meja: Meja 6', ipAddress: '192.168.1.100', createdAt: '2026-05-17 15:15:00' },
  { id: 22, userId: 1, userName: 'Admin', aksi: 'LOGIN', keterangan: 'Admin login ke sistem', ipAddress: '192.168.1.100', createdAt: '2026-05-18 07:00:00' },
  { id: 23, userId: 3, userName: 'Budi', aksi: 'LOGIN', keterangan: 'Budi login ke sistem', ipAddress: '192.168.1.102', createdAt: '2026-05-18 07:30:00' },
  { id: 24, userId: 3, userName: 'Budi', aksi: 'CREATE_ORDER', keterangan: 'Pesanan baru dari Meja 2: Kopi x2, Roti Bakar x1', ipAddress: '192.168.1.102', createdAt: '2026-05-18 08:00:00' },
  { id: 25, userId: 2, userName: 'Siti', aksi: 'LOGIN', keterangan: 'Siti login ke sistem', ipAddress: '192.168.1.101', createdAt: '2026-05-18 08:15:00' },
  { id: 26, userId: 2, userName: 'Siti', aksi: 'PROCESS_PAYMENT', keterangan: 'Pembayaran pesanan #005: Rp35,000 (Transfer)', ipAddress: '192.168.1.101', createdAt: '2026-05-18 09:00:00' },
  { id: 27, userId: 3, userName: 'Budi', aksi: 'UPDATE_ORDER_STATUS', keterangan: 'Pesanan #006 selesai', ipAddress: '192.168.1.102', createdAt: '2026-05-18 09:30:00' },
  { id: 28, userId: 1, userName: 'Admin', aksi: 'UPDATE_USER', keterangan: 'Nonaktifkan user: Budi', ipAddress: '192.168.1.100', createdAt: '2026-05-18 10:00:00' },
  { id: 29, userId: 1, userName: 'Admin', aksi: 'DELETE_USER', keterangan: 'Menghapus user: Budi', ipAddress: '192.168.1.100', createdAt: '2026-05-18 10:05:00' },
  { id: 30, userId: 1, userName: 'Admin', aksi: 'LOGOUT', keterangan: 'Admin logout dari sistem', ipAddress: '192.168.1.100', createdAt: '2026-05-18 17:00:00' },
]

const aksiColors: Record<JenisAksi, string> = {
  LOGIN: 'bg-blue-100 text-blue-800',
  LOGOUT: 'bg-slate-100 text-slate-800',
  CREATE_USER: 'bg-purple-100 text-purple-800',
  UPDATE_USER: 'bg-purple-100 text-purple-800',
  DELETE_USER: 'bg-red-100 text-red-800',
  CREATE_MENU: 'bg-orange-100 text-orange-800',
  UPDATE_MENU: 'bg-orange-100 text-orange-800',
  DELETE_MENU: 'bg-red-100 text-red-800',
  CREATE_MEJA: 'bg-teal-100 text-teal-800',
  UPDATE_MEJA: 'bg-teal-100 text-teal-800',
  DELETE_MEJA: 'bg-red-100 text-red-800',
  CREATE_ORDER: 'bg-amber-100 text-amber-800',
  UPDATE_ORDER_STATUS: 'bg-amber-100 text-amber-800',
  CANCEL_ORDER: 'bg-red-100 text-red-800',
  PROCESS_PAYMENT: 'bg-green-100 text-green-800',
}

const aksiLabels: Record<JenisAksi, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE_USER: 'Tambah User',
  UPDATE_USER: 'Update User',
  DELETE_USER: 'Hapus User',
  CREATE_MENU: 'Tambah Menu',
  UPDATE_MENU: 'Update Menu',
  DELETE_MENU: 'Hapus Menu',
  CREATE_MEJA: 'Tambah Meja',
  UPDATE_MEJA: 'Update Meja',
  DELETE_MEJA: 'Hapus Meja',
  CREATE_ORDER: 'Pesanan Baru',
  UPDATE_ORDER_STATUS: 'Update Status',
  CANCEL_ORDER: 'Batal Pesanan',
  PROCESS_PAYMENT: 'Pembayaran',
}

const aksiKategori: Record<string, JenisAksi[]> = {
  Semua: [],
  Auth: ['LOGIN', 'LOGOUT'],
  User: ['CREATE_USER', 'UPDATE_USER', 'DELETE_USER'],
  Menu: ['CREATE_MENU', 'UPDATE_MENU', 'DELETE_MENU'],
  Meja: ['CREATE_MEJA', 'UPDATE_MEJA', 'DELETE_MEJA'],
  Pesanan: ['CREATE_ORDER', 'UPDATE_ORDER_STATUS', 'CANCEL_ORDER'],
  Pembayaran: ['PROCESS_PAYMENT'],
}

const uniqueUsers = [...new Set(mockLogs.map((l) => l.userName))]

export default function LoggingPage() {
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterKategori, setFilterKategori] = useState<string>('Semua')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterUser, filterKategori])

  const filteredLogs = useMemo(() => {
    let result = mockLogs

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (log) =>
          log.userName.toLowerCase().includes(q) ||
          log.keterangan.toLowerCase().includes(q) ||
          log.ipAddress.toLowerCase().includes(q)
      )
    }

    if (filterUser !== 'all') {
      result = result.filter((log) => log.userName === filterUser)
    }

    if (filterKategori !== 'Semua') {
      const selectedAksis = aksiKategori[filterKategori]
      if (selectedAksis) {
        result = result.filter((log) => selectedAksis.includes(log.aksi))
      }
    }

    return result
  }, [search, filterUser, filterKategori])

  const totalPages = Math.ceil(filteredLogs.length / 10)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Logging</h1>
        <span className="text-sm text-gray-500">{mockLogs.length} total log</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <Input
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-[200px] text-sm pl-8"
          />
        </div>
        <Select value={filterKategori} onValueChange={setFilterKategori}>
          <SelectTrigger className="h-8 w-[140px] text-sm">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(aksiKategori).map((kategori) => (
              <SelectItem key={kategori} value={kategori}>
                {kategori}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua User</SelectItem>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead className="max-w-md">Keterangan</TableHead>
              <TableHead className="w-32">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  Tidak ada log yang ditemukan
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-gray-500 text-xs font-mono">{log.id}</TableCell>
                  <TableCell className="text-xs text-gray-600 whitespace-nowrap">{log.createdAt}</TableCell>
                  <TableCell className="font-medium">{log.userName || '-'}</TableCell>
                  <TableCell>
                    <Badge className={aksiColors[log.aksi]}>
                      {aksiLabels[log.aksi]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-md truncate">{log.keterangan}</TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">{log.ipAddress}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="text-sm text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-9"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
