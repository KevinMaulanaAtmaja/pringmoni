"use client"

import { useEffect, useRef } from "react"
import Pusher from "pusher-js"

const ORDERS_CHANNEL = "orders"
const PESANAN_EVENTS = ["new_order", "order_updated", "order_paid"]

export function useOrdersRealtime(onEvent: () => void) {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    if (!pusherKey) return

    let channel: ReturnType<Pusher["subscribe"]> | null = null
    let pusher: Pusher | null = null

    const pusherInstance = new Pusher(pusherKey, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    })
    pusher = pusherInstance
    channel = pusherInstance.subscribe(ORDERS_CHANNEL)
    for (const event of PESANAN_EVENTS) {
      channel.bind(event, () => onEventRef.current())
    }

    return () => {
      if (channel) channel.unbind_all()
      if (pusher) pusher.disconnect()
    }
  }, [])
}