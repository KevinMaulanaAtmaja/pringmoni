export const EVENT_KONEKSI_PUTUS = "pringmoni:koneksi-putus";

const POLA_JARINGAN = [
  "failed to fetch",
  "networkerror",
  "network error",
  "fetch failed",
  "load failed",
  "econnreset",
  "econnrefused",
  "etimedout",
  "timeout",
  "offline",
];

export function apakahErrorJaringan(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (!error) return false;

  const pesan = error instanceof Error ? error.message : String(error);
  const teks = pesan.toLowerCase();
  return POLA_JARINGAN.some((pola) => teks.includes(pola));
}

export function laporkanKoneksiPutus(detail?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string | undefined>(EVENT_KONEKSI_PUTUS, { detail }),
  );
}
