import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { UserProvider } from "@/lib/user-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <UserProvider role={session.user.role}>
      <div className="flex min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 h-screen">
          <Sidebar role={session.user.role} />
        </div>
        <main className="flex-1 ml-64 p-6">
          <Header />
          {children}
        </main>
      </div>
    </UserProvider>
  )
}
