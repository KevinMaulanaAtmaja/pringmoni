"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginAction } from '@/app/actions/login'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, ShieldAlert } from "lucide-react"

const initialState = {
  error: '',
  success: false,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [sesiDiambilAlih, setSesiDiambilAlih] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [state.success, router])

  // Sesi ini sebelumnya digantikan login dari perangkat lain (proxy mengarahkan
  // ke ?takenOver=1). Dialog hanya tampil sekali: parameter URL langsung
  // dibersihkan supaya tidak muncul lagi saat halaman di-refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('takenOver') !== '1') return
    const timer = setTimeout(() => setSesiDiambilAlih(true), 0)
    window.history.replaceState(null, '', '/login')
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <Card className="w-full max-w-md sm:max-w-2xl lg:max-w-3xl shadow-lg border-slate-200 my-auto">
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
                Username / Email
              </Label>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh@email.com"
                autoComplete="username"
                required
                className="h-12 text-lg px-5 py-3 w-full border-slate-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-12 text-lg px-5 py-3 w-full border-slate-300 focus:border-green-500 focus:ring-green-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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

      <Dialog open={sesiDiambilAlih} onOpenChange={setSesiDiambilAlih}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Sesi diambil alih
            </DialogTitle>
            <DialogDescription>
              Akun ini baru saja dipakai login di perangkat lain, sehingga sesi
              Anda di perangkat ini telah berakhir. Silakan login kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={() => setSesiDiambilAlih(false)}>
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
