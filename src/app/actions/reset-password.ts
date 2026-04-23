"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function resetPasswordAction(prevState: { error: string; success: string }, formData: FormData) {
  const username = formData.get("username") as string

  if (!username) {
    return { error: "Username wajib diisi", success: "" }
  }

  const user = await prisma.users.findFirst({
    where: { username },
  })

  if (!user) {
    return { error: "Username tidak ditemukan", success: "" }
  }

  return { error: "", success: "Link reset password telah dikirim ke email Anda" }
}
