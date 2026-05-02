import { auth } from "@/lib/auth"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/logout"

export async function Header() {
  const session = await auth()

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
          {session?.user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-semibold text-sm">{session?.user?.name || "User"}</p>
          <p className="text-xs text-gray-500 capitalize">{session?.user?.role || "User"}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </form>
    </header>
  )
}
