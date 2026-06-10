import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function PesananBaruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'cashier')) {
    redirect("/dashboard")
  }

  return <>{children}</>
}
