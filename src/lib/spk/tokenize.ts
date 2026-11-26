const STOPWORDS_ID = new Set([
  "yang",
  "dan",
  "di",
  "ini",
  "itu",
  "mau",
  "pengen",
  "deh",
  "sih",
  "aduh",
  "sudah",
  "belum",
  "akan",
  "bisa",
  "tidak",
  "ya",
  "gak",
  "aja",
  "doang",
  "kok",
  "gitu",
  "lah",
  "nih",
  "sah",
  "jugak",
  "saja",
  "lebih",
])

const PREFIXES = ["meng", "ment", "meny", "me", "ber", "di", "ter", "ke", "peng", "pem", "per", "dis", "dig", "ny", "men", "mem"].sort((a, b) => b.length - a.length)
const SUFFIXES = ["kan", "an", "nya"]

export function stem(token: string): string {
  let hasil = token.toLowerCase()
  let berubah = true

  while (berubah) {
    berubah = false
    const prefix = PREFIXES.find((item) => hasil.startsWith(item) && hasil.length - item.length > 2)
    if (prefix) {
      hasil = hasil.slice(prefix.length)
      berubah = true
      continue
    }
    const suffix = SUFFIXES.find((item) => hasil.endsWith(item) && hasil.length - item.length > 2)
    if (suffix) {
      hasil = hasil.slice(0, hasil.length - suffix.length)
      berubah = true
    }
  }

  return hasil
}

export function tokenize(teks: string): string[] {
  const tokens = teks
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0)

  const hasil: string[] = []
  for (const token of tokens) {
    const kata = stem(token)
    if (kata.length < 2) continue
    if (STOPWORDS_ID.has(kata)) continue
    hasil.push(kata)
  }

  return hasil
}
