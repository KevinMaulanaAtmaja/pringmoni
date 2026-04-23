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
  session: { strategy: "jwt" },
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
          console.log('Missing credentials')
          return null
        }

        console.log('=== LOGIN DEBUG ===')
        console.log('Username:', credentials.username)
        
        try {
          console.log('Attempting database query...')
          
          const user = await prisma.users.findUnique({
            where: { username: credentials.username as string },
          })

          console.log('User found:', user ? 'YES' : 'NO')
          if (user) {
            console.log('User id:', user.id)
            console.log('User status:', user.status)
          }

          if (!user) {
            console.log('User not found - returning null')
            return null
          }

          if (!user.status) {
            console.log('User status is false - returning null')
            return null
          }

          console.log('Comparing password...')
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          console.log('Password valid:', isValid)

          if (!isValid) {
            console.log('Password invalid - returning null')
            return null
          }

          console.log('Login successful!')
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as RoleUser
        session.user.id = token.id as string
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
    }
  }
}