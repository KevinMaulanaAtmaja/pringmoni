"use client";

import { cn } from "@/lib/utils";

interface PageLoaderProps {
  /** Optional text shown below the spinner. Defaults to "Memuat...". */
  label?: string;
  /** Optional className to override the overlay container. */
  className?: string;
}

/**
 * Reusable full-viewport loading overlay with a dark backdrop and a
 * centered emerald spinner. Used by route-level `loading.tsx` files to
 * provide instant visual feedback during page transitions.
 */
export function PageLoader({ label = "Memuat...", className }: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300",
        className
      )}
    >
      <div className="relative h-12 w-12">
        {/* Outer light ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        {/* Spinning top segment */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
