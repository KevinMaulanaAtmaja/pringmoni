import { auth } from "@/lib/auth"
import { User } from "lucide-react"

export async function Header() {
  const session = await auth()

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b">
      <span className="text-gray-600">Halo, {session?.user?.name}</span>
      <div className="flex items-center gap-2 text-gray-500">
        <User className="w-4 h-4" />
        <span className="text-sm capitalize">{session?.user?.role || session?.user?.name}</span>
      </div>
    </header>
  )
}
