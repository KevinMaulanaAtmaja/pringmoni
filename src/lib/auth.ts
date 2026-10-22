import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { ambilVersiSesi, catatVersiSesi } from "@/lib/sesi"
import type { RoleUser } from "@/types"


interface CustomUser {
  id: string
  role: RoleUser
  sessionVersion?: number
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 43200 }, // 12 jam
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        deviceId: { label: "ID Perangkat", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.users.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { email: credentials.username },
              ],
            },
          })

          if (!user) {
            return null
          }

          if (!user.status) {
            return null
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            return null
          }

          // Naikkan versi sesi akun ini. Sesi lama (yang membawa versi
          // sebelumnya) otomatis tidak berlaku lagi -> fitur "ambil alih".
          const deviceId =
            typeof credentials.deviceId === "string" && credentials.deviceId
              ? credentials.deviceId
              : null

          const updated = await prisma.users.update({
            where: { id: user.id },
            data: {
              sessionVersion: { increment: 1 },
              lastLoginAt: new Date(),
              lastLoginDevice: deviceId,
            },
            select: { sessionVersion: true },
          })
          catatVersiSesi(user.id, updated.sessionVersion)

          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role,
            sessionVersion: updated.sessionVersion,
          }
        } catch (error: unknown) {
          const err = error as Error & { code?: string; message?: string }
          console.error('=== LOGIN ERROR ===')
          console.error('Error code:', err.code)
          console.error('Error message:', err.message)
          
          if (err.code === 'P1001' || err.message?.includes('DatabaseNotReachable')) {
            console.log('Database connection error - returning special response')
            throw new Error('DATABASE_ERROR')
          }
          
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const custom = user as CustomUser
        token.role = custom.role
        token.id = custom.id
        token.username = user.name
        token.sessionVersion = custom.sessionVersion ?? 0
        return token
      }

      // Request berikutnya: bandingkan versi sesi pada token dengan versi di
      // database. Kalau berbeda berarti ada login baru (ambil alih) sehingga
      // sesi ini sudah tidak berlaku.
      const userId = parseInt(token.id as string, 10)
      const versiToken = typeof token.sessionVersion === "number" ? token.sessionVersion : 0
      if (!Number.isNaN(userId)) {
        const versiDb = await ambilVersiSesi(userId)
        if (versiDb !== null && versiDb !== versiToken) {
          token.takenOver = true
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = (token.role as RoleUser) ?? "waiter"
        session.user.id = (token.id as string) ?? ""
        session.user.username = token.username as string
        session.user.takenOver = (token.takenOver as boolean | undefined) === true
      }
      return session
    },
  },
})

declare module "next-auth" {
  interface User {
    sessionVersion?: number
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: RoleUser
      username?: string
      takenOver?: boolean
    }
  }
}