'use server'

import { signIn } from "@/lib/auth"

export async function loginAction(prevState: { error: string }, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  try {
    await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    return { success: true, error: '' }
  } catch (error: unknown) {
    const err = error as Error & { message?: string; cause?: Error & { message?: string } }
    const errMsg = err.message || err.cause?.message || ''
    if (errMsg === 'DATABASE_ERROR') {
      return { success: false, error: 'Database tidak dapat dihubungi. Silakan coba lagi.' }
    }
    return { success: false, error: 'Username atau password salah' }
  }
}
