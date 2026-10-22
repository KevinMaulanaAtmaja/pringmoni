"use client"

import { useActionState, useEffect, useRef, useState, startTransition } from "react"
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
  perluKonfirmasi: false,
  info: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [konfirmasiBuka, setKonfirmasiBuka] = useState(false)
  const [sesiDiambilAlih, setSesiDiambilAlih] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [state.success, router])

  // Sesi ini sebelumnya digantikan login dari perangkat lain (proxy mengarahkan ke ?takenOver=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('takenOver') === '1') {
      const timer = setTimeout(() => setSesiDiambilAlih(true), 0)
      return () => clearTimeout(timer)
    }
  }, [])

  // Munculkan dialog konfirmasi setiap server action mengembalikan perluKonfirmasi
  useEffect(() => {
    if (!state.perluKonfirmasi) return
    const timer = setTimeout(() => setKonfirmasiBuka(true), 0)
    return () => clearTimeout(timer)
  }, [state])

  const handleAmbilAlih = () => {
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    data.set('takeover', '1')
    startTransition(() => {
      formAction(data)
    })
  }

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
          {sesiDiambilAlih && (
            <div className="mb-4 p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Sesi Anda sebelumnya telah diambil alih oleh login lain. Silakan login kembali dengan akun Anda.
              </span>
            </div>
          )}

          <form action={formAction} ref={formRef} className="space-y-4">
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

      <Dialog open={konfirmasiBuka} onOpenChange={setKonfirmasiBuka}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sesi aktif terdeteksi</DialogTitle>
            <DialogDescription>
              {state.info || "Akun ini sedang digunakan di perangkat lain."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setKonfirmasiBuka(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button onClick={handleAmbilAlih} disabled={isPending}>
              {isPending ? "Memproses..." : "Ambil Alih & Masuk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
