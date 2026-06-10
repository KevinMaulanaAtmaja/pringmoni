'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
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
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { getLogs, getUniqueUsers, getLogCount, type LogItem } from '@/app/actions/logs'

type JenisAksi =
  | 'LOGIN' | 'LOGOUT' | 'RESET_PASSWORD'
  | 'CREATE_ORDER' | 'UPDATE_ORDER_STATUS'
  | 'CANCEL_ORDER_KASIR' | 'CANCEL_ORDER_EXPIRED' | 'CANCEL_ORDER_STALE'
  | 'PROCESS_PAYMENT'

const aksiColors: Record<JenisAksi, string> = {
  LOGIN: 'bg-blue-100 text-blue-800',
  LOGOUT: 'bg-slate-100 text-slate-800',
  RESET_PASSWORD: 'bg-purple-100 text-purple-800',
  CREATE_ORDER: 'bg-amber-100 text-amber-800',
  UPDATE_ORDER_STATUS: 'bg-amber-100 text-amber-800',
  CANCEL_ORDER_KASIR: 'bg-orange-100 text-orange-800',
  CANCEL_ORDER_EXPIRED: 'bg-yellow-100 text-yellow-800',
  CANCEL_ORDER_STALE: 'bg-yellow-100 text-yellow-800',
  PROCESS_PAYMENT: 'bg-green-100 text-green-800',
}

const aksiLabels: Record<JenisAksi, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  RESET_PASSWORD: 'Reset Password',
  CREATE_ORDER: 'Pesanan Baru',
  UPDATE_ORDER_STATUS: 'Update Status',
  CANCEL_ORDER_KASIR: 'Batal (Kasir)',
  CANCEL_ORDER_EXPIRED: 'Batal (Expired)',
  CANCEL_ORDER_STALE: 'Batal (Stale)',
  PROCESS_PAYMENT: 'Pembayaran',
}

const aksiKategori: Record<string, JenisAksi[]> = {
  Semua: [],
  Auth: ['LOGIN', 'LOGOUT', 'RESET_PASSWORD'],
  Pesanan: ['CREATE_ORDER', 'UPDATE_ORDER_STATUS'],
  Pembatalan: ['CANCEL_ORDER_KASIR', 'CANCEL_ORDER_EXPIRED', 'CANCEL_ORDER_STALE'],
  Pembayaran: ['PROCESS_PAYMENT'],
}

export default function LoggingPage() {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterKategori, setFilterKategori] = useState<string>('Semua')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = useCallback(async () => {
    const [logsRes, usersRes, countRes] = await Promise.all([
      getLogs(),
      getUniqueUsers(),
      getLogCount(),
    ])
    if (!logsRes.error) setLogs(logsRes.data)
    setUniqueUsers(usersRes)
    setTotalCount(countRes)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterUser, filterKategori])

  const filteredLogs = useMemo(() => {
    let result = logs

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (log) =>
          log.userName.toLowerCase().includes(q) ||
          (log.keterangan?.toLowerCase() ?? '').includes(q) ||
          (log.ipAddress?.toLowerCase() ?? '').includes(q)
      )
    }

    if (filterUser !== 'all') {
      result = result.filter((log) => log.userName === filterUser)
    }

    if (filterKategori !== 'Semua') {
      const selectedAksis = aksiKategori[filterKategori]
      if (selectedAksis) {
        result = result.filter((log) => selectedAksis.includes(log.aksi as JenisAksi))
      }
    }

    return result
  }, [search, filterUser, filterKategori, logs])

  const totalPages = Math.ceil(filteredLogs.length / 10)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Logging</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {loading ? 'Memuat...' : `${totalCount} total log`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  Memuat data log...
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
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
                    <Badge className={aksiColors[log.aksi as JenisAksi]}>
                      {aksiLabels[log.aksi as JenisAksi]}
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
