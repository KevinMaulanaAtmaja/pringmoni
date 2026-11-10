# Penjelasan Test Operasi Database — `meja-operasi.test.ts`

> File ini berisi penjelasan test case operasi database dari file terpisah
> `src/test/unit/app/actions/meja-operasi.test.ts`.

---

## Konsep Dasar (mengapa ada `describe`, `it`, `expect`, mock)

- **`describe('getMeja', ...)`** : grup / kategori test.
- **`it('...', async ...)`** : satu kasus uji.
- **`expect(...)`** : assertion / pemeriksaan nilai.
- **`.mockResolvedValue(v)`** : mock async function → return resolved bernilai `v`.
- **`.mockResolvedValueOnce(v)`** : mock async function → return resolved bernilai `v` (sekali pakai).
- **`beforeEach` / `afterEach`** : hook before / after tiap test.
- **`vi.mock(...)`** : mock module (auth, log, cache, prisma).

---

## Test Case 1 — `getMeja` : menolak tanpa session

- **Lokasi:** `src/test/unit/app/actions/meja-operasi.test.ts` baris **47–54**
- **Tujuan:** tanpa session harus ditolak, dan DB tidak boleh disentuh.

```ts
it('menolak tanpa session', async () => {
  authMock.mockResolvedValue(null)

  const hasil = await getMeja()

  expect(hasil).toEqual({ error: 'Unauthorized' })
  expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
})
```

**Penjelasan:**
1. `authMock.mockResolvedValue(null)` → tidak ada session.
2. `await getMeja()` → action dipanggil.
3. `expect(hasil).toEqual({ error: 'Unauthorized' })` → hasil ditolak.
4. `expect(prismaMock.$queryRaw).not.toHaveBeenCalled()` → query DB tidak dipanggil.

---

## Test Case 2 — `getMeja` : mengembalikan daftar meja aktif

- **Lokasi:** `src/test/unit/app/actions/meja-operasi.test.ts` baris **56–65**
- **Tujuan:** dengan session valid, query DB mengembalikan daftar meja aktif.

```ts
it('mengembalikan daftar meja aktif', async () => {
  const daftar = [mejaFixture()]
  prismaMock.$queryRaw.mockResolvedValue(daftar)

  const hasil = await getMeja()

  expect(hasil).toEqual(daftar)
  expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
})
```

**Penjelasan:**
1. `prismaMock.$queryRaw.mockResolvedValue(daftar)` → DB mengembalikan daftar.
2. `await getMeja()` → action membaca daftar.
3. `expect(hasil).toEqual(daftar)` → hasil sesuai.
4. `expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)` → query dipanggil sekali.

---

## Test Case 3 — `createMeja` : membuat meja dengan token unik

- **Lokasi:** `src/test/unit/app/actions/meja-operasi.test.ts` baris **68–80**
- **Tujuan:** operasi create meja sukses → write DB dipancat, token dibuat, cache di-revalidate.

```ts
it('membuat meja dengan token unik', async () => {
  prismaMock.$queryRaw
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])

  const hasil = await createMeja(null, formData({ kapasitas: '4', tipeMeja: 'kursi' }))

  expect(hasil).toEqual({ success: true })
  expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
  expect(randomUuidMock).toHaveBeenCalledTimes(1)
  expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')
})
```

**Penjelasan:**
1. 3x `.mockResolvedValueOnce([])` → mock nilai per call query DB.
2. `await createMeja(...)` → action create meja.
3. `expect(hasil).toEqual({ success: true })` → sukses.
4. `expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)` → write DB dipancat.
5. `expect(randomUuidMock).toHaveBeenCalledTimes(1)` → token UUID dibuat.
6. `expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard/meja')` → cache di-revalidate.

---

## Test Case 4 — `createMeja` : menolak kapasitas

- **Lokasi:** `src/test/unit/app/actions/meja-operasi.test.ts` baris **82–87**
- **Tujuan:** validasi gagal → DB write tidak dipancat.

```ts
it.each(['0', '21', 'abc'])('menolak kapasitas %s', async (kapasitas) => {
  const hasil = await createMeja(null, formData({ kapasitas, tipeMeja: 'kursi' }))

  expect(hasil).toEqual({ error: 'Kapasitas harus antara 1-20 orang' })
  expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
})
```

**Penjelasan:**
1. `it.each([...])` → loop beberapa data.
2. Kapasitas invalid → action return error.
3. `expect(prismaMock.$executeRaw).not.toHaveBeenCalled()` → write DB tidak terjadi.

---

## Test Case 5 — `kosongkanMeja` : tidak membatalkan pesanan

- **Lokasi:** `src/test/unit/app/actions/meja-operasi.test.ts` baris **91–102**
- **Tujuan:** kondisi tidak ada pesanan aktif → update DB tidak dipancat.

```ts
it('tidak membatalkan pesanan saat tidak ada yang menunggu', async () => {
  prismaMock.$queryRaw
    .mockResolvedValueOnce([{ nomor_meja: 'K01', status_meja: 'terpakai' }])
    .mockResolvedValueOnce([{ id: 2, statusPembayaran: 'berhasil', totalHarga: 20000 }])

  const hasil = await kosongkanMeja(1)

  expect(hasil).toEqual({ success: true })
  expect(prismaMock.pesanan.updateMany).not.toHaveBeenCalled()
  expect(createLogMock).toHaveBeenCalledWith('UPDATE_ORDER_STATUS', expect.stringContaining('berhasil: 1'))
})
```

**Penjelasan:**
1. Mock query DB per call.
2. `await kosongkanMeja(1)` → action cek status.
3. `expect(prismaMock.pesanan.updateMany).not.toHaveBeenCalled()` → update DB tidak dipancat.
4. `expect(createLogMock).toHaveBeenCalledWith(...)` → log sesuai kondisi.

---

## Ringkasan

- File test: `src/test/unit/app/actions/meja-operasi.test.ts`
- File penjelasan ini: `.opencode/MEJA_OPERASI_TEST.md`
- Hasil: 7/7 test passed, lint bersih.
