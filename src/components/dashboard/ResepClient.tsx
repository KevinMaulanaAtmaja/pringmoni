'use client'

import { useEffect, useMemo, useState } from 'react'
import { CookingPot, Search, Trash2, ChefHat } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getDaftarMenuResep,
  hapusResepBahan,
  type MenuResepRingkasan,
} from '@/app/actions/stok-bahan'
import { ResepMenuDialog } from '@/components/dashboard/resep-menu-dialog'
import { butuhBumbu } from '@/lib/resep'

const satuanLabels: Record<string, string> = {
  kg: 'kg',
  pcs: 'pcs',
  pack: 'pack',
  bungkus: 'bungkus',
}

const URUTAN_KATEGORI = ['Makanan', 'Minuman', 'Camilan']

export function ResepClient() {
  const [data, setData] = useState<MenuResepRingkasan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [onlyLengkap, setOnlyLengkap] = useState(false)
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [dialogMenu, setDialogMenu] = useState<MenuResepRingkasan | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    try {
      setData(await getDaftarMenuResep())
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const daftarKategori = useMemo(() => {
    const set = new Set(data.map((m) => m.kategori || 'Tanpa Kategori'))
    return Array.from(set).sort((a, b) => {
      const ia = URUTAN_KATEGORI.indexOf(a)
      const ib = URUTAN_KATEGORI.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [data])

  const terfilter = useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.filter((m) => {
      if (kategoriFilter && (m.kategori || 'Tanpa Kategori') !== kategoriFilter)
        return false
      if (onlyLengkap && !m.lengkap) return false
      if (q === '') return true
      return (
        m.namaMenu.toLowerCase().includes(q) ||
        m.kategori.toLowerCase().includes(q)
      )
    })
  }, [data, search, onlyLengkap, kategoriFilter])

  async function handleRemove(resepBahanId: number) {
    setRemoving(resepBahanId)
    try {
      const result = await hapusResepBahan(resepBahanId)
      if ('error' in result && result.error) return
      await load()
    } finally {
      setRemoving(null)
    }
  }

  const grupKategori = useMemo(() => {
    const map = new Map<string, MenuResepRingkasan[]>()
    for (const m of terfilter) {
      const k = m.kategori || 'Tanpa Kategori'
      const arr = map.get(k)
      if (arr) arr.push(m)
      else map.set(k, [m])
    }
    // Yang perlu dilengkapi tampil dulu, lalu mode manual, terakhir yang sudah lengkap.
    const rangking = (m: MenuResepRingkasan) =>
      !m.adaResep ? 1 : !m.lengkap ? 0 : 2
    for (const arr of map.values()) {
      arr.sort((a, b) => rangking(a) - rangking(b))
    }
    return Array.from(map.entries()).sort((a, b) => {
      const ia = URUTAN_KATEGORI.indexOf(a[0])
      const ib = URUTAN_KATEGORI.indexOf(b[0])
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0])
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [terfilter])

  function renderKartu(m: MenuResepRingkasan) {
    const wajibBumbu = butuhBumbu(m.kategori)
    return (
      <Card key={m.id} className="py-3">
        <CardContent className="px-3 py-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                {m.namaMenu}
              </h3>
              <p className="text-[10px] text-muted-foreground">{m.kategori}</p>
            </div>
            {!m.adaResep ? (
              <Badge
                variant="outline"
                className="text-[9px] text-gray-500 border-gray-300 shrink-0"
                title="Belum ada bahan di resep — ketersediaan mengikuti status menu"
              >
                Manual
              </Badge>
            ) : m.lengkap ? (
              <Badge
                variant="outline"
                className="text-[9px] text-emerald-700 border-emerald-300 shrink-0"
                title="Stok dilacak otomatis dari resep"
              >
                Otomatis
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[9px] text-amber-700 border-amber-300 shrink-0"
                title={
                  wajibBumbu
                    ? 'Menu Makanan idealnya punya 1 bahan utama + 1 bumbu'
                    : 'Stok dilacak otomatis; menu ini cukup punya bahan utama'
                }
              >
                Otomatis · belum lengkap
              </Badge>
            )}
          </div>

          {m.adaResep && (
            <div
              className={`mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
                m.porsiTersedia <= 0
                  ? "bg-red-100 text-red-700"
                  : m.porsiTersedia <= 5
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-50 text-emerald-700"
              }`}
              title={
                m.bahanPembatas.length > 0
                  ? `Dibatasi oleh: ${m.bahanPembatas.join(', ')}`
                  : undefined
              }
            >
              <CookingPot className="w-3.5 h-3.5 shrink-0" />
              {m.porsiTersedia <= 0
                ? "Stok habis"
                : `Sisa ${m.porsiTersedia} porsi`}
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 py-0"
              title="Jumlah bahan utama"
            >
              Utama: {m.jumlahBahanUtama}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 py-0"
              title={
                wajibBumbu
                  ? 'Jumlah bahan bumbu'
                  : 'Bumbu opsional untuk kategori ini'
              }
            >
              Bumbu: {m.jumlahBahanBumbu}
              {!wajibBumbu && ' (opsional)'}
            </Badge>
          </div>

          {m.bahan.length === 0 ? (
            <p className="text-[11px] text-muted-foreground mt-2">
              Belum ada resep untuk menu ini.
            </p>
          ) : (
            <ul className="mt-2 space-y-0.5">
              {m.bahan.map((b) => (
                <li
                  key={b.resepId}
                  className="flex items-center justify-between gap-2 rounded-md border px-1.5 py-0.5"
                >
                  <span className="text-[11px] truncate">{b.namaBahan}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {b.jumlah} {satuanLabels[b.satuan] ?? b.satuan}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      title="Hapus dari resep"
                      disabled={removing === b.resepId}
                      onClick={() => handleRemove(b.resepId)}
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Button
            size="sm"
            className="h-7 text-[11px] w-full mt-2"
            onClick={() => setDialogMenu(m)}
          >
            <CookingPot className="w-3 h-3" />
            Kelola Resep
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu atau kategori..."
            className="h-9 text-sm pl-8"
          />
        </div>
        <Button
          variant={onlyLengkap ? 'default' : 'outline'}
          size="sm"
          className="h-9 text-xs"
          onClick={() => setOnlyLengkap((v) => !v)}
        >
          <ChefHat className="w-3.5 h-3.5" />
          Resep Lengkap Saja
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant={kategoriFilter === '' ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setKategoriFilter('')}
        >
          Semua
        </Button>
        {daftarKategori.map((k) => (
          <Button
            key={k}
            variant={kategoriFilter === k ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setKategoriFilter(k)}
          >
            {k}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-4">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="mt-3 h-3 w-1/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : terfilter.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <CookingPot className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2">
                  {data.length === 0
                    ? 'Belum ada menu. Tambahkan menu dulu di halaman Menu.'
                    : onlyLengkap
                      ? 'Belum ada menu dengan resep lengkap.'
                      : 'Tidak ada menu yang cocok dengan filter.'}
                </p>
          </CardContent>
        </Card>
) : (
        <div className="space-y-6">
          {grupKategori.map(([kategori, menus]) => {
            const belumLengkap = menus.filter(
              (m) => m.adaResep && !m.lengkap
            ).length
            return (
              <section key={kategori} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CookingPot className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {kategori}
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    {menus.length}
                  </Badge>
                  {belumLengkap > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-700 border-amber-300"
                    >
                      {belumLengkap} belum lengkap
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {menus.map(renderKartu)}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <ResepMenuDialog
        open={dialogMenu != null}
        onOpenChange={(open) => {
          if (!open) setDialogMenu(null)
        }}
        menuId={dialogMenu?.id ?? 0}
        namaMenu={dialogMenu?.namaMenu ?? ''}
        kategoriMenu={dialogMenu?.kategori ?? ''}
        onSaved={load}
      />
    </div>
  )
}