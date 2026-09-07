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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, User as UserIcon, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  UserWithRole,
} from '@/app/actions/users'
import { RoleUser } from '@prisma/client'

const roleColors: Record<RoleUser, string> = {
  owner: 'bg-purple-100 text-purple-800',
  cashier: 'bg-blue-100 text-blue-800',
  waiter: 'bg-orange-100 text-orange-800',
}

const roleLabels: Record<RoleUser, string> = {
  owner: 'Owner',
  cashier: 'Kasir',
  waiter: 'Waiter',
}

const ITEMS_PER_PAGE = 5

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'waiter' as RoleUser,
    status: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Delete confirmation states
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Filter states
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterRole, filterStatus])

  async function loadData() {
    setLoading(true)
    try {
      const usersData = await getUsers()
      setUsers(usersData)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  function openDialog(user?: UserWithRole) {
    setError(null)
    setShowPassword(false)
    if (user) {
      setEditingId(user.id)
      setForm({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
        status: user.status,
      })
    } else {
      setEditingId(null)
      setForm({
        username: '',
        email: '',
        password: '',
        role: 'waiter',
        status: true,
      })
    }
    setIsOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        const result = await updateUser({
          id: editingId,
          username: form.username,
          email: form.email || undefined,
          role: form.role,
          status: form.status,
          password: form.password || undefined,
        })
        if ('error' in result && result.error) {
          setError(result.error)
          return
        }
      } else {
        const result = await createUser({
          username: form.username,
          email: form.email || undefined,
          password: form.password,
          role: form.role,
        })
        if ('error' in result && result.error) {
          setError(result.error)
          return
        }
      }
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
      const result = await deleteUser(deleteId)
      if (result?.error) {
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

  // Filter logic
  const filteredUsers = useMemo(() => {
    let result = users

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(u =>
        u.username.toLowerCase().includes(s) ||
        (u.email && u.email.toLowerCase().includes(s))
      )
    }

    if (filterRole !== 'all') {
      result = result.filter(u => u.role === filterRole)
    }

    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active'
      result = result.filter(u => u.status === isActive)
    }

    return result
  }, [users, search, filterRole, filterStatus])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Kelola Akun</h1>
      </div>

      {/* Filters + Tambah Button */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-[200px] text-sm px-3"
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="cashier">Kasir</SelectItem>
            <SelectItem value="waiter">Waiter</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
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
              <TableHead className="h-9">Username</TableHead>
              <TableHead className="h-9">Email</TableHead>
              <TableHead className="h-9">Role</TableHead>
              <TableHead className="h-9">Status</TableHead>
              <TableHead className="h-9 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative h-5 w-5">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {search || filterRole !== 'all' || filterStatus !== 'all'
                    ? 'Tidak ada akun yang sesuai filter'
                    : 'Belum ada akun'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user, index) => (
                <TableRow key={user.id} className="h-12">
                  <TableCell className="py-2">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3 h-3 text-gray-400" />
                      <span className="font-medium text-sm">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-sm">{user.email || '-'}</TableCell>
                  <TableCell className="py-2">
                    <Badge className={`${roleColors[user.role]} text-xs`}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge variant={user.status ? 'default' : 'secondary'} className="text-xs">
                      {user.status ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openDialog(user)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      {user.role !== 'owner' && (
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(user.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
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

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setShowPassword(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Akun' : 'Tambah Akun Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3 py-3">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password {editingId ? '(kosongkan jika tidak diubah)' : ''}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required={!editingId}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                {!editingId && (
                  <p className="text-xs text-gray-500">
                    Min 8 karakter, huruf besar, huruf kecil, angka, simbol
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm({ ...form, role: value as RoleUser })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="cashier">Kasir</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingId && (
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status ? 'active' : 'inactive'}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value === 'active' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => handleDeleteCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Akun</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan.
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
    </div>
  )
}
