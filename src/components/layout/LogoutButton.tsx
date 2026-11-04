"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/logout"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition mr-1"
          title="Logout"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keluar dari Sistem</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin logout? Anda akan diarahkan ke halaman login.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <form action={logoutAction} className="inline">
            <Button type="submit" variant="destructive">
              Logout
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}