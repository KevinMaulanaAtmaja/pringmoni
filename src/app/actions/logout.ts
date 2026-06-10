'use server'

import { signOut, auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createLog } from "@/lib/log"

export async function logoutAction() {
  const session = await auth()
  const username = session?.user?.username || session?.user?.name || 'Unknown'
  await createLog('LOGOUT', `User ${username} logout dari sistem`)
  await signOut({ redirect: false })
  redirect('/login')
}
