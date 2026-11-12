#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ENV_FILES = ['.env.test.local', '.env.test', '.env']

function loadEnvFile(file) {
  if (!existsSync(file)) return

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(file)
    return
  }

  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) process.env[key] = value
  }
}

for (const file of ENV_FILES) loadEnvFile(file)

function fail(message) {
  console.error(`\n[test-db] ${message}\n`)
  process.exit(1)
}

const testUrl = process.env.TEST_DATABASE_URL

if (!testUrl) {
  fail(
    'TEST_DATABASE_URL belum diset. Salin dari .env.example, lalu jalankan `npm run test:db:up`.'
  )
}

try {
  new URL(testUrl)
} catch {
  fail('TEST_DATABASE_URL bukan URL PostgreSQL yang valid.')
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL === testUrl) {
  fail('TEST_DATABASE_URL tidak boleh sama dengan DATABASE_URL (DB dev/production).')
}

const command = process.argv[2] ?? 'help'
const env = {
  ...process.env,
  DATABASE_URL: testUrl,
  DIRECT_URL: testUrl,
}
const CLI = {
  prisma: path.resolve('node_modules', 'prisma', 'build', 'index.js'),
  vitest: path.resolve('node_modules', 'vitest', 'vitest.mjs'),
}

function run(cliPath, args) {
  if (!existsSync(cliPath)) {
    fail(`CLI tidak ditemukan: ${cliPath}. Jalankan \`npm install\` terlebih dahulu.`)
  }

  const result = spawnSync(process.execPath, [cliPath, ...args], {
    stdio: 'inherit',
    env,
  })
  if (result.error) fail(result.error.message)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

switch (command) {
  case 'push':
    run(CLI.prisma, ['db', 'push', '--skip-generate'])
    break
  case 'reset':
    run(CLI.prisma, ['db', 'push', '--force-reset', '--skip-generate'])
    break
  case 'test':
    run(CLI.prisma, ['db', 'push', '--skip-generate'])
    run(CLI.vitest, [
      'run',
      ...(process.argv.length > 3 ? process.argv.slice(3) : ['src/test/integration']),
    ])
    break
  default:
    console.log('Usage: node scripts/test-db.mjs <push|reset|test>')
}
