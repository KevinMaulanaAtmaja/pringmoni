import Pusher from "pusher"

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
const pusherSecret = process.env.PUSHER_SECRET
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1"

let pusherClient: Pusher | null = null
if (pusherKey && pusherSecret) {
  pusherClient = new Pusher({
    appId: process.env.PUSHER_APP_ID || "",
    key: pusherKey,
    secret: pusherSecret,
    cluster: pusherCluster,
    useTLS: true,
  })
}

export const ORDERS_CHANNEL = "orders"

export const PESANAN_EVENTS = {
  newOrder: "new_order",
  orderUpdated: "order_updated",
  orderPaid: "order_paid",
} as const

export async function triggerPusher(channel: string, event: string, data: unknown) {
  if (!pusherClient) return
  try {
    await pusherClient.trigger(channel, event, data)
  } catch (error) {
    console.error("Pusher trigger error:", error)
  }
}