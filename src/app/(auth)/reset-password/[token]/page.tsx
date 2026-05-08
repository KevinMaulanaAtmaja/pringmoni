'use client'

import { useActionState, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordConfirmAction } from '@/app/actions/reset-password-confirm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

const initialState = {
  error: '',
  success: false,
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordConfirmAction, initialState)
  const [showPasswords, setShowPasswords] = useState(false)
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg">
              Password berhasil direset! Silakan login dengan password baru.
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="bg-green-600 hover:bg-green-700"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Masukkan password baru Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            {state?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 z-10"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="Ulangi password baru"
                  required
                  className="pr-10"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-green-600 hover:bg-green-700"
            >
              {isPending ? 'Menyimpan...' : 'Reset Password'}
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
