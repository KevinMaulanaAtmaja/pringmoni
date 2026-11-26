import { vi } from 'vitest'

type MockFunction = ReturnType<typeof vi.fn>

export type PrismaModelMock = {
  findFirst: MockFunction
  findFirstOrThrow: MockFunction
  findUnique: MockFunction
  findUniqueOrThrow: MockFunction
  findMany: MockFunction
  create: MockFunction
  createMany: MockFunction
  update: MockFunction
  updateMany: MockFunction
  upsert: MockFunction
  delete: MockFunction
  deleteMany: MockFunction
  count: MockFunction
  aggregate: MockFunction
  groupBy: MockFunction
}

export type PrismaMock = {
  users: PrismaModelMock
  jadwalShift: PrismaModelMock
  shiftKasir: PrismaModelMock
  kasKeluar: PrismaModelMock
  meja: PrismaModelMock
  tipeMeja: PrismaModelMock
  kategoriMenu: PrismaModelMock
  menu: PrismaModelMock
  menuFoto: PrismaModelMock
  pesanan: PrismaModelMock
  detailPesanan: PrismaModelMock
  refundBukti: PrismaModelMock
  reservasi: PrismaModelMock
  voucher: PrismaModelMock
  logs: PrismaModelMock
  stokBahan: PrismaModelMock
  riwayatStok: PrismaModelMock
  resepMenu: PrismaModelMock
  $transaction: MockFunction
  $queryRaw: MockFunction
  $executeRaw: MockFunction
  $queryRawUnsafe: MockFunction
  $executeRawUnsafe: MockFunction
}

function model(): PrismaModelMock {
  return {
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  }
}

export function createPrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    users: model(),
    jadwalShift: model(),
    shiftKasir: model(),
    kasKeluar: model(),
    meja: model(),
    tipeMeja: model(),
    kategoriMenu: model(),
    menu: model(),
    menuFoto: model(),
    pesanan: model(),
    detailPesanan: model(),
    refundBukti: model(),
    reservasi: model(),
    voucher: model(),
    logs: model(),
    stokBahan: model(),
    riwayatStok: model(),
    resepMenu: model(),
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    $queryRawUnsafe: vi.fn(),
    $executeRawUnsafe: vi.fn(),
  }

  prisma.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: PrismaMock) => unknown)(prisma)
    }
    return Promise.all(arg as Promise<unknown>[])
  })

  return prisma
}

export const prismaMock = createPrismaMock()
