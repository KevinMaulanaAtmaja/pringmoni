"use client"

import { useEffect, useRef } from "react"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceInput } from "@/hooks/use-voice-input"

interface VoiceSearchButtonProps {
  onTranskrip: (teks: string) => void
}

export function VoiceSearchButton({ onTranskrip }: VoiceSearchButtonProps) {
  const { transkrip, listening, didukung, error, mulaiDengar, berhentiDengar } = useVoiceInput()
  const pernahMendengar = useRef(false)
  const onTranskripRef = useRef(onTranskrip)

  useEffect(() => {
    onTranskripRef.current = onTranskrip
  }, [onTranskrip])

  useEffect(() => {
    if (pernahMendengar.current && !listening && transkrip.trim()) {
      onTranskripRef.current(transkrip.trim())
    }
    pernahMendengar.current = listening
  }, [listening, transkrip])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0"
      disabled={!didukung}
      title={!didukung ? "Browser ini tidak mendukung input suara" : error ?? "Cari pesanan pakai suara"}
      aria-label={listening ? "Hentikan pencarian suara" : "Cari pesanan pakai suara"}
      onClick={() => {
        if (listening) {
          berhentiDengar()
        } else {
          pernahMendengar.current = true
          mulaiDengar()
        }
      }}
    >
      {listening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}
