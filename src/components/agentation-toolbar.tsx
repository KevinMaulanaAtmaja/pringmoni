'use client'

import { useSyncExternalStore } from 'react'
import { Agentation } from 'agentation'

const subscribe = () => () => {}

const getEndpoint = () => {
  if (typeof window === "undefined") return ""
  return `${window.location.protocol}//${window.location.hostname}:4747`
}

const getServerEndpoint = () => ""

export default function AgentationToolbar() {
  const enabled =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_AGENTATION_ENABLED === "true"

  // Hook harus selalu dipanggil dalam urutan yang sama setiap render
  // (tanpa early return sebelumnya) agar tidak melanggar Rules of Hooks.
  const endpoint = useSyncExternalStore(
    subscribe,
    getEndpoint,
    getServerEndpoint
  )

  if (!enabled) return null

  return <Agentation endpoint={endpoint} appName="Pringmoni" />
}
