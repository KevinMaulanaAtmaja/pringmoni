'use client'

import { useEffect, useState } from 'react'
import { Agentation } from 'agentation'

export default function AgentationToolbar() {
  const [endpoint, setEndpoint] = useState<string | null>(null)

  useEffect(() => {
    setEndpoint(`${window.location.protocol}//${window.location.hostname}:4747`)
  }, [])

  return (
    <Agentation
      endpoint={endpoint ?? undefined}
      appName="Pringmoni"
    />
  )
}
