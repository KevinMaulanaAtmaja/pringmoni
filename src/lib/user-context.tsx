"use client"

import { createContext, useContext } from "react"

interface UserContextValue {
  role: string
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  role,
  children,
}: {
  role: string
  children: React.ReactNode
}) {
  return <UserContext.Provider value={{ role }}>{children}</UserContext.Provider>
}

export function useUserRole(): string | null {
  const ctx = useContext(UserContext)
  return ctx?.role ?? null
}
