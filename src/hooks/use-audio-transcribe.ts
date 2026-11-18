"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

const tanpaLangganan = () => () => {}

function didukungDiClient(): boolean {
  if (typeof navigator === "undefined" || typeof MediaRecorder === "undefined") return false
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

export interface HasilAudioTranscribe {
  recording: boolean
  loading: boolean
  didukung: boolean
  error: string | null
  mulaiRekam: () => void
  berhentiRekam: () => void
  reset: () => void
}

export function useAudioTranscribe(
  tokenMeja: string,
  onTranskrip: (teks: string) => void
): HasilAudioTranscribe {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const onTranskripRef = useRef(onTranskrip)
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const didukung = useSyncExternalStore(tanpaLangganan, didukungDiClient, () => false)

  useEffect(() => {
    onTranskripRef.current = onTranskrip
  }, [onTranskrip])

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
    setRecording(false)
    setLoading(false)
    setError(null)
  }, [])

  const mulaiRekam = useCallback(async () => {
    setError(null)
    if (!didukung) {
      setError("Browser ini tidak mendukung perekaman audio. Silakan ketik manual.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mime = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"]
        .find((tipe) => MediaRecorder.isTypeSupported(tipe)) ?? ""
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        setError("Perekaman audio gagal. Silakan coba lagi atau ketik manual.")
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        setRecording(false)

        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
        if (audio.size === 0) {
          setError("Tidak ada audio yang terekam. Silakan coba lagi.")
          return
        }
        if (audio.size > 25 * 1024 * 1024) {
          setError("Audio terlalu besar (maksimal 25 MB). Silakan rekam ulang lebih pendek.")
          return
        }

        setLoading(true)
        try {
          const form = new FormData()
          form.append("tokenMeja", tokenMeja)
          form.append("audio", audio, "suara.webm")

          const response = await fetch("/api/transcribe", { method: "POST", body: form })
          const data = await response.json()
          if (!response.ok) {
            setError(data.error ?? "Gagal mengenali suara. Silakan ketik manual.")
            return
          }

          const teks = typeof data.transkrip === "string" ? data.transkrip.trim() : ""
          if (!teks) {
            setError("Transkripsi kosong. Silakan coba lagi atau ketik manual.")
            return
          }
          onTranskripRef.current(teks)
        } catch {
          setError("Tidak dapat mengunggah audio. Silakan ketik manual.")
        } finally {
          setLoading(false)
        }
      }

      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch (error) {
      const pesan = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Izin mikrofon ditolak. Aktifkan izin mikrofon di browser."
        : "Mikrofon tidak dapat dibuka. Silakan ketik manual."
      setError(pesan)
    }
  }, [didukung, tokenMeja])

  const berhentiRekam = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  return { recording, loading, didukung, error, mulaiRekam, berhentiRekam, reset }
}
