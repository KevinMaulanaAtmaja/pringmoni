import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { DashboardClient } from "@/components/layout/DashboardClient"
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
      <DashboardClient role={session.user.role} header={<Header />}>
        {children}
      </DashboardClient>
    </UserProvider>
  )
}
