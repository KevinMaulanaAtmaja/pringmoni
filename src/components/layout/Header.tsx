import { auth } from "@/lib/auth"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/logout"
import { ClockDisplay } from "./ClockDisplay"

export async function Header() {
  const session = await auth()
 
  return (
    <header className="flex items-center justify-between w-full mb-3 pb-2 border-b">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
          {session?.user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-semibold text-xs">{session?.user?.name || "User"}</p>
          <p className="text-xs text-gray-500 capitalize">{session?.user?.role || "User"}</p>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <ClockDisplay />
      </div>
      <div className="flex justify-end shrink-0">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition mr-1"
            title="Logout"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </header>
  )
}
