export function gabungCatatanItem(
  catatan: string | null | undefined,
  varian: string | null | undefined,
): string | null {
  const catatanBersih = catatan?.trim() || "";
  const varianBersih = varian?.trim();
  if (!varianBersih) return catatanBersih || null;
  const tag = `[Varian: ${varianBersih}]`;
  return catatanBersih ? `${tag} Catatan: ${catatanBersih}` : tag;
}

export function pisahCatatanItem(catatanItem: string | null | undefined): {
  varian: string | null
  catatan: string | null
} {
  if (!catatanItem) {
    return { varian: null, catatan: null }
  }

  const trimmed = catatanItem.trim()
  if (!trimmed) {
    return { varian: null, catatan: null }
  }

  const varianMatch = trimmed.match(/\[Varian:\s*([^\]]+)\]/i)
  const varian = varianMatch ? varianMatch[1].trim() : null

  const catatan = trimmed
    .replace(/\[Varian:\s*[^\]]+\]/gi, '')
    .replace(/Catatan:\s*/gi, '')
    .trim()

  if (catatan === '') {
    return { varian, catatan: null }
  }

  return { varian, catatan }
}
