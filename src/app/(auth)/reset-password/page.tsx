'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/app/actions/forgot-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const initialState = {
  error: '',
  success: '',
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Lupa Password</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima link reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <div className="text-center space-y-4">
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg">
                {state.success}
              </div>
              <Link href="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email"
                  autoComplete="email"
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-green-600 hover:bg-green-700"
              >
                {isPending ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
