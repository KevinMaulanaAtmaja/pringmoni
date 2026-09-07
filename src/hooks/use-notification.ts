'use client'

import { useCallback, useRef } from 'react'

type NotificationType = 'new_order' | 'order_paid'

/**
 * Shared notification hook for the dashboard.
 * Provides sound + voice notifications for new orders and paid orders.
 *
 * Sound designs:
 * - New Order : double beep (880Hz + 660Hz) + voice
 * - Order Paid: triple higher-pitched beep (1100Hz + 880Hz + 1100Hz) + voice
 */
export function useNotification() {
  // Keep a reference to a single AudioContext so we don't create a new one
  // for every beep (browsers limit the number of AudioContexts).
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      if (typeof window === 'undefined') return null
      if (!audioCtxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!Ctx) return null
        audioCtxRef.current = new Ctx()
      }
      // Resume if suspended (browsers require user gesture to start audio)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {})
      }
      return audioCtxRef.current
    } catch {
      return null
    }
  }, [])

  /**
   * Play a single sine beep at the given frequency.
   */
  const playBeep = useCallback(
    (frequency: number, duration: number, delay: number = 0) => {
      const ctx = getAudioContext()
      if (!ctx) return
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = frequency
        gain.gain.value = 0.3
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + delay)
        osc.stop(ctx.currentTime + delay + duration)
      } catch {
        // Audio not available — silently ignore
      }
    },
    [getAudioContext]
  )

  /**
   * Speak the given text in Indonesian.
   */
  const speak = useCallback((text: string) => {
    try {
      if (typeof window === 'undefined') return
      if (!('speechSynthesis' in window)) return
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'id-ID'
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    } catch {
      // Speech synthesis not supported — silently ignore
    }
  }, [])

  /**
   * Play the appropriate sound for a notification type.
   */
  const playSound = useCallback(
    (type: NotificationType) => {
      if (type === 'new_order') {
        // Double beep: 880Hz then 660Hz
        playBeep(880, 0.25, 0)
        playBeep(660, 0.25, 0.3)
      } else if (type === 'order_paid') {
        // Triple higher-pitched beep: 1100Hz, 880Hz, 1100Hz
        playBeep(1100, 0.2, 0)
        playBeep(880, 0.2, 0.25)
        playBeep(1100, 0.25, 0.5)
      }
    },
    [playBeep]
  )

  /**
   * Combined sound + voice for a new order.
   */
  const notifyNewOrder = useCallback(
    (nomorMeja: string, namaPelanggan?: string | null) => {
      playSound('new_order')
      const text = namaPelanggan
        ? `Pesanan baru dari meja ${nomorMeja}, atas nama ${namaPelanggan}`
        : `Pesanan baru dari meja ${nomorMeja}`
      speak(text)
    },
    [playSound, speak]
  )

  /**
   * Combined sound + voice for a paid order.
   */
  const notifyOrderPaid = useCallback(
    (nomorMeja: string, namaPelanggan?: string | null, totalHarga?: number) => {
      playSound('order_paid')
      const hargaText =
        totalHarga !== undefined && totalHarga !== null
          ? `, total ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(totalHarga)}`
          : ''
      const text = namaPelanggan
        ? `Pesanan dari meja ${nomorMeja} atas nama ${namaPelanggan} telah dibayar${hargaText}`
        : `Pesanan dari meja ${nomorMeja} telah dibayar${hargaText}`
      speak(text)
    },
    [playSound, speak]
  )

  return {
    playSound,
    speak,
    notifyNewOrder,
    notifyOrderPaid,
  }
}
