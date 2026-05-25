"use client";

import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function PembayaranLangkahRedirect() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenMeja = params.tokenMeja as string;
  const metode = params.metode as string;
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
      router.replace(`/${tokenMeja}/pembayaran/${metode}?orderId=${orderId}`);
    } else {
      router.replace(`/${tokenMeja}/pembayaran/${metode}`);
    }
  }, [router, tokenMeja, metode, orderId]);

  return null;
}
