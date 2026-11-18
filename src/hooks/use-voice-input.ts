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
  processLocally?: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionOpsiModel {
  langs: string[]
  processLocally?: boolean
}

type SpeechRecognitionCtor = {
  new (): SpeechRecognitionLike
  available?: (opsi: SpeechRecognitionOpsiModel) => Promise<string>
  install?: (opsi: SpeechRecognitionOpsiModel) => Promise<boolean>
}

const BAHASA = "id-ID"
const tanpaLangganan = () => () => {}

function ambilKonstruktor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const jendela = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return jendela.SpeechRecognition ?? jendela.webkitSpeechRecognition ?? null
}

function adalahFirefox(): boolean {
  if (typeof navigator === "undefined") return false
  return /firefox|fxios/i.test(navigator.userAgent) && !/seamonkey/i.test(navigator.userAgent)
}

function punyaModeLokal(Konstruktor: SpeechRecognitionCtor): boolean {
  return typeof Konstruktor.available === "function" && "processLocally" in Konstruktor.prototype
}

async function siapkanModelLokal(Konstruktor: SpeechRecognitionCtor): Promise<string | null> {
  if (!punyaModeLokal(Konstruktor) || typeof Konstruktor.available !== "function") return null

  const opsi: SpeechRecognitionOpsiModel = { langs: [BAHASA], processLocally: true }
  try {
    const status = await Konstruktor.available.call(Konstruktor, opsi)
    if (status === "available") return null
    if (status === "downloading") {
      return "Model bahasa Indonesia sedang diunduh. Coba lagi setelah unduhan selesai."
    }
    if (status === "downloadable" && typeof Konstruktor.install === "function") {
      const berhasil = await Konstruktor.install.call(Konstruktor, opsi)
      return berhasil ? null : "Model bahasa Indonesia gagal diunduh. Periksa koneksi lalu coba lagi."
    }
    if (status === "unavailable") {
      return "Model bahasa Indonesia tidak tersedia untuk perangkat ini. Silakan ketik manual."
    }
    return null
  } catch {
    return null
  }
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
    case "language-not-supported":
      return "Bahasa Indonesia belum didukung pengenalan suara browser ini. Silakan ketik manual."
    case "aborted":
      return "Perekaman suara dibatalkan."
    default:
      return "Pengenalan suara gagal. Silakan ketik manual."
  }
}

export interface HasilVoiceInput {
  transkrip: string
  listening: boolean
  menyiapkan: boolean
  didukung: boolean
  error: string | null
  mulaiDengar: () => void
  berhentiDengar: () => void
  reset: () => void
}

export function useVoiceInput(): HasilVoiceInput {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const sibukRef = useRef(false)
  const sesiRef = useRef(0)
  const [transkrip, setTranskrip] = useState("")
  const [listening, setListening] = useState(false)
  const [menyiapkan, setMenyiapkan] = useState(false)
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
    sesiRef.current += 1
    sibukRef.current = false
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setTranskrip("")
    setListening(false)
    setMenyiapkan(false)
    setError(null)
  }, [])

  const mulaiDengar = useCallback(async () => {
    const Konstruktor = ambilKonstruktor()
    if (!Konstruktor) {
      setError("Browser ini tidak mendukung input suara. Silakan ketik manual.")
      return
    }
    if (sibukRef.current) return

    sibukRef.current = true
    const sesi = sesiRef.current + 1
    sesiRef.current = sesi

    recognitionRef.current?.abort()
    recognitionRef.current = null
    setTranskrip("")
    setError(null)

    try {
      const pakaiModeLokal = adalahFirefox() && punyaModeLokal(Konstruktor)
      if (pakaiModeLokal) {
        setMenyiapkan(true)
        const pesan = await siapkanModelLokal(Konstruktor)
        if (sesi !== sesiRef.current) return
        setMenyiapkan(false)
        if (pesan) {
          setError(pesan)
          return
        }
      }

      const recognition = new Konstruktor()
      recognition.lang = BAHASA
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      if (pakaiModeLokal) recognition.processLocally = true

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
      recognition.start()
      setListening(true)
    } catch {
      setError("Perekaman suara tidak dapat dimulai. Silakan ketik manual.")
      setListening(false)
    } finally {
      sibukRef.current = false
      if (sesi === sesiRef.current) setMenyiapkan(false)
    }
  }, [])

  const berhentiDengar = useCallback(() => {
    sesiRef.current += 1
    sibukRef.current = false
    recognitionRef.current?.stop()
    setListening(false)
    setMenyiapkan(false)
  }, [])

  return { transkrip, listening, menyiapkan, didukung, error, mulaiDengar, berhentiDengar, reset }
}
