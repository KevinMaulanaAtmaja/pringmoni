"use client"

import { useEffect, useState } from "react"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function ClockDisplay() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hari = time.toLocaleDateString("id-ID", { weekday: "long" })
  const tgl = time.getDate()
  const bulan = time.toLocaleDateString("id-ID", { month: "long" })
  const tahun = time.getFullYear()
  const jam = `${pad(time.getHours())}.${pad(time.getMinutes())}`

  return (
    <p className="text-sm font-bold text-gray-800 tabular-nums tracking-wide">
      {hari}, {tgl} {bulan} {tahun} | {jam}
    </p>
  )
}