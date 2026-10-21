'use client'

import { useSyncExternalStore } from 'react'
import { Agentation } from 'agentation'

const subscribe = () => () => {}

const getEndpoint = () =>
  `${window.location.protocol}//${window.location.hostname}:4747`

const getServerEndpoint = () => undefined

export default function AgentationToolbar() {
  const endpoint = useSyncExternalStore(
    subscribe,
    getEndpoint,
    getServerEndpoint
  )

  return <Agentation endpoint={endpoint} appName="Pringmoni" />
}
