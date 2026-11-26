"use client";

import { KoneksiErrorFallback } from "@/components/layout/KoneksiErrorFallback";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <KoneksiErrorFallback error={error} unstable_retry={unstable_retry} />;
}
