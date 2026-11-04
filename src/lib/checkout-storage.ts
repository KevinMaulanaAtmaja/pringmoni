import type { KeranjangItem } from "@/components/customer/cart-sheet";

export const CHECKOUT_STORAGE_KEY = "pringmoni_checkout_cart";
export const CHECKOUT_VOUCHER_KEY = "pringmoni_checkout_voucher";

export function simpanKeranjangCheckout(items: KeranjangItem[]): void {
  sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(items));
}

export function ambilKeranjangCheckout(): KeranjangItem[] | null {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as KeranjangItem[];
  } catch {
    return null;
  }
}

export function hapusKeranjangCheckout(): void {
  sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_VOUCHER_KEY);
}

/** Simpan kode voucher yang dipilih customer (null = tanpa voucher) */
export function simpanKodeVoucher(kode: string | null): void {
  if (!kode) {
    sessionStorage.removeItem(CHECKOUT_VOUCHER_KEY);
    return;
  }
  sessionStorage.setItem(CHECKOUT_VOUCHER_KEY, kode);
}

export function ambilKodeVoucher(): string | null {
  try {
    return sessionStorage.getItem(CHECKOUT_VOUCHER_KEY);
  } catch {
    return null;
  }
}