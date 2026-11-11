import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          console.error('[auth] Validasi input gagal:', parsed.error.format())
          return null
        }

        const { email, password } = parsed.data

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, name, email, password, role')
          .ilike('email', email.trim())
          .single()

        if (error || !user) {
          console.error(
            '[auth] Login gagal:',
            error ? `Database error: ${error.message}` : `User dengan email "${email}" tidak ditemukan di database.`
          )
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          console.error(`[auth] Login gagal: Password tidak cocok untuk "${email}".`)
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { role: string }).role = token.role as string
      }
      return session
    },
  },
})
