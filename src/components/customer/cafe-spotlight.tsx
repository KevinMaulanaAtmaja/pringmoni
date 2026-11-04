"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coffee } from "lucide-react";

interface CafeSpotlightProps {
  onClick: () => void;
}

export function CafeSpotlight({ onClick }: CafeSpotlightProps) {
  return (
    <Card className="relative mb-4 overflow-hidden border-amber-300/60 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-sm">
      {/* Background shimmer */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:animate-cafe-shimmer" />
      {/* Floating steam/beans */}
      <div className="pointer-events-none absolute -top-4 left-8 size-6 rounded-full bg-white/60 opacity-0 motion-safe:animate-cafe-steam" />
      <div className="pointer-events-none absolute -top-5 left-14 size-5 rounded-full bg-white/70 opacity-0 [animation-delay:0.3s] motion-safe:animate-cafe-steam" />
      <div className="pointer-events-none absolute -top-3 left-20 size-7 rounded-full bg-white/60 opacity-0 [animation-delay:0.6s] motion-safe:animate-cafe-steam" />
      <div className="pointer-events-none absolute right-10 top-2 size-4 -rotate-12 rounded-full bg-amber-700/20 motion-safe:animate-cafe-float" />
      <div className="pointer-events-none absolute right-6 bottom-8 size-6 rotate-6 rounded-full bg-amber-700/10 [animation-delay:0.5s] motion-safe:animate-cafe-float" />
      <div className="pointer-events-none absolute left-4 bottom-6 size-5 -rotate-3 rounded-full bg-amber-700/15 [animation-delay:0.9s] motion-safe:animate-cafe-float" />

      <div className="relative flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm ring-2 ring-amber-200/70 motion-safe:animate-cafe-pulse-ring">
            <Coffee className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-amber-900 motion-safe:animate-cafe-pop">
              Pringmoni Cafe
            </h2>
            <p className="text-xs text-amber-800/80 motion-safe:animate-cafe-pop [animation-delay:0.05s]">
              Kopi, Matcha, Latte, Teh & Signatures.
            </p>
          </div>
        </div>
        <Button
          onClick={onClick}
          size="sm"
          className="rounded-full bg-amber-600 px-4 text-white shadow hover:bg-amber-700"
        >
          Intip Menu Cafe
        </Button>
      </div>
    </Card>
  );
}
