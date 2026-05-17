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
  const nama = searchParams.get("nama");

  useEffect(() => {
    const query = new URLSearchParams();
    if (orderId) query.set("orderId", orderId);
    if (nama) query.set("nama", nama);
    const qs = query.toString();
    router.replace(`/${tokenMeja}/pembayaran/${metode}${qs ? `?${qs}` : ""}`);
  }, [router, tokenMeja, metode, orderId, nama]);

  return null;
}
