import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { KasirOrderNotifications } from "@/components/dashboard/KasirOrderNotifications"

export default async function KasirLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
    redirect("/dashboard")
  }

  return (
    <>
      <KasirOrderNotifications />
      {children}
    </>
  )
}