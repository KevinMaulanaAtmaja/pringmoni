"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

interface SpeechRecognitionItem {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechRecognitionResults {
  length: number
  [index: number]: SpeechRecognitionItem
}

interface SpeechRecognitionResultEvent {
  resultIndex: number
  results: SpeechRecognitionResults
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

const tanpaLangganan = () => () => {}

function ambilKonstruktor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const jendela = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return jendela.SpeechRecognition ?? jendela.webkitSpeechRecognition ?? null
}

function pesanError(kode: string): string {
  switch (kode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Izin mikrofon ditolak. Aktifkan izin mikrofon di browser terlebih dahulu."
    case "no-speech":
      return "Tidak ada suara yang terdeteksi. Coba lagi atau ketik permintaan Anda."
    case "audio-capture":
      return "Mikrofon tidak tersedia. Periksa perangkat mikrofon Anda."
    case "network":
      return "Jaringan bermasalah saat mengenali suara. Silakan ketik manual."
    case "aborted":
      return "Perekaman suara dibatalkan."
    default:
      return "Pengenalan suara gagal. Silakan ketik manual."
  }
}

export interface HasilVoiceInput {
  transkrip: string
  listening: boolean
  didukung: boolean
  error: string | null
  mulaiDengar: () => void
  berhentiDengar: () => void
  reset: () => void
}

export function useVoiceInput(): HasilVoiceInput {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [transkrip, setTranskrip] = useState("")
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didukung = useSyncExternalStore(
    tanpaLangganan,
    () => Boolean(ambilKonstruktor()),
    () => false
  )

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setTranskrip("")
    setListening(false)
    setError(null)
  }, [])

  const mulaiDengar = useCallback(() => {
    const Konstruktor = ambilKonstruktor()
    if (!Konstruktor) {
      setError("Browser ini tidak mendukung input suara. Silakan ketik manual.")
      return
    }

    recognitionRef.current?.abort()
    setTranskrip("")
    setError(null)

    const recognition = new Konstruktor()
    recognition.lang = "id-ID"
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let final = ""
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const hasil = event.results[i]
        const teks = hasil?.[0]?.transcript ?? ""
        if (hasil?.isFinal) {
          final += teks
        } else {
          interim += teks
        }
      }
      setTranskrip((final || interim).trim())
    }
    recognition.onerror = (event) => {
      setError(pesanError(event.error))
    }
    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      setError("Perekaman suara tidak dapat dimulai. Silakan ketik manual.")
      setListening(false)
    }
  }, [])

  const berhentiDengar = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { transkrip, listening, didukung, error, mulaiDengar, berhentiDengar, reset }
}
