'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const initialState = {
  error: '',
  success: false,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mb-6">
        
      </div>
      <Card className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg border-slate-200 my-auto">
        <CardHeader className="space-y-1 text-center px-4 md:px-8 pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Masuk untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-4 md:px-8">
          <form action={formAction} className="space-y-4">
            {state?.error && !state.success && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {state.error}
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
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                required
                className="h-12 text-lg px-5 py-3 w-full border-slate-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div className="flex justify-end pt-1">
              <Link href="/reset-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Lupa password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 text-lg font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg mt-2"
            >
              {isPending ? 'Loading...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}