import type { KeranjangItem } from "@/components/customer/cart-sheet";

export const CHECKOUT_STORAGE_KEY = "pringmoni_checkout_cart";

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
}