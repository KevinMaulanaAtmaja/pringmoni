/**
 * Akun blackbox test yang dibuat SEKALI lewat `npm run test:e2e:seed`.
 *
 * Jangan membuat akun login baru di dalam test. Semua test memakai akun tetap
 * di bawah ini supaya:
 * - tidak ada sampah user baru setiap kali suite dijalankan;
 * - sesi login stabil dan mudah di-debug;
 * - kredensial cukup dicatat di satu tempat (file ini + dokumentasi).
 *
 * Nilai default boleh dioverride lewat env, mis. E2E_KASIR_PASSWORD.
 * Password di sini HANYA untuk akun test, bukan akun produksi.
 */

export type TestAccountKey =
  | 'owner'
  | 'cashier'
  | 'waiter'
  | 'kitchen'
  | 'takeover'

export type TestRole = 'owner' | 'cashier' | 'waiter' | 'kitchen'

export type Credentials = {
  username: string
  password: string
}

export type TestAccount = Credentials & {
  role: TestRole
  label: string
}

export const TEST_ACCOUNTS: Record<TestAccountKey, TestAccount> = {
  owner: {
    username: 'e2e_owner',
    password: 'Owner123!',
    role: 'owner',
    label: 'Owner',
  },
  cashier: {
    username: 'e2e_kasir',
    password: 'Kasir123!',
    role: 'cashier',
    label: 'Kasir',
  },
  waiter: {
    username: 'e2e_waiter',
    password: 'Waiter123!',
    role: 'waiter',
    label: 'Pelayan',
  },
  kitchen: {
    username: 'e2e_kitchen',
    password: 'Kitchen123!',
    role: 'kitchen',
    label: 'Dapur',
  },
  // Akun khusus skenario ambil alih sesi. Terpisah dari e2e_owner agar
  // storageState owner yang dipakai project chromium tidak ikut ter-logout.
  takeover: {
    username: 'e2e_takeover',
    password: 'Takeover123!',
    role: 'owner',
    label: 'Takeover',
  },
}

function envName(key: TestAccountKey, suffix: 'USERNAME' | 'PASSWORD') {
  return `E2E_${key.toUpperCase()}_${suffix}`
}

/** Kredensial akun test tetap; env menimpa default bila di-set. */
export function testAccount(key: TestAccountKey): Credentials {
  const account = TEST_ACCOUNTS[key]

  return {
    username: process.env[envName(key, 'USERNAME')] ?? account.username,
    password: process.env[envName(key, 'PASSWORD')] ?? account.password,
  }
}

export function testAccountRole(key: TestAccountKey): TestRole {
  return TEST_ACCOUNTS[key].role
}
