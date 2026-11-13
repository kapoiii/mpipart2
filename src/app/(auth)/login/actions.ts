'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string || '').trim()
  const password = (formData.get('password') as string || '')
  const callbackUrl = formData.get('callbackUrl') as string | null

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi' }
  }

  try {
    // Ambil role pengguna dari Supabase untuk menentukan redirect
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .ilike('email', email)
      .single()

    const targetUrl = user?.role === 'ADMIN'
      ? '/admin/trips'
      : (callbackUrl && !callbackUrl.startsWith('/admin') ? callbackUrl : '/')

    await signIn('credentials', {
      email,
      password,
      redirectTo: targetUrl,
    })

    return { success: true, redirectUrl: targetUrl }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email atau kata sandi salah' }
        default:
          return { error: 'Terjadi kesalahan saat masuk' }
      }
    }
    // Re-throw redirect agar Next.js memproses navigasi
    throw error
  }
}

