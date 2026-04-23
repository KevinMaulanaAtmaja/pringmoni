'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPasswordAction } from '@/app/actions/reset-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const initialState = {
  error: '',
  success: '',
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="w-40 h-40 md:w-48 md:h-48 mb-6">
        <img 
          src="/logo-pringmoni.jpeg" 
          alt="Logo Pringmoni" 
          className="w-full h-full object-contain"
        />
      </div>
      <Card className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg border-slate-200 my-auto">
        <CardHeader className="space-y-1 text-center px-4 md:px-8 pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">Reset Password</CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Masukkan username untuk reset password
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-4 md:px-8">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {state.error}
              </div>
            )}
            
            {state?.success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg">
                {state.success}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium text-sm">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Masukkan username"
                required
                className="h-12 text-lg px-5 py-3 w-full border-slate-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 text-lg font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg mt-2"
            >
              {isPending ? 'Menunggu...' : 'Kirim Link Reset'}
            </Button>
            
            <p className="text-center text-sm text-slate-500 mt-2">
              Kembali ke{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}