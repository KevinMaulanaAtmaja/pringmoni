import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import type { RoleUser } from "@/types"


interface CustomUser {
  id: string
  role: RoleUser
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role,
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
        token.role = (user as CustomUser).role
        token.id = (user as CustomUser).id
        token.username = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = (token.role as RoleUser) ?? "waiter"
        session.user.id = (token.id as string) ?? ""
        session.user.username = token.username as string
      }
      return session
    },
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: RoleUser
      username?: string
    }
  }
}