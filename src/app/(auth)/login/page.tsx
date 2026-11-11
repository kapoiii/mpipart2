'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IconMountain, IconAlertCircle, IconSpinner } from '@/components/icons'
import { loginAction } from './actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const registered = searchParams.get('registered')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      if (callbackUrl) formData.append('callbackUrl', callbackUrl)

      const result = await loginAction(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        // Redirection in progress
        return
      }
      console.error('Login submit error:', err)
      setError('Gagal masuk. Silakan periksa kembali email dan password Anda.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      {registered && (
        <div style={{
          padding: '0.85rem', borderRadius: 10,
          background: '#dcfce7', border: '1px solid #86efac',
          color: '#15803d', fontSize: '0.875rem', textAlign: 'center', fontWeight: 600,
        }}>
          Pendaftaran berhasil! Silakan masuk dengan akun Anda.
        </div>
      )}

      <div>
        <label className="input-label" htmlFor="email">Alamat Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input-field"
          placeholder="nama@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="input-label" htmlFor="password">Kata Sandi</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input-field"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div style={{
          padding: '0.85rem', borderRadius: 10,
          background: '#fee2e2', border: '1px solid #fca5a5',
          color: '#b91c1c', fontSize: '0.875rem', textAlign: 'center', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <IconAlertCircle size={16} color="#b91c1c" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading}
        style={{ justifyContent: 'center', padding: '0.85rem', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}>
        {loading ? (
          <><IconSpinner size={16} /> Memproses...</>
        ) : (
          'Masuk Sekarang'
        )}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="hero-gradient" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative',
    }}>
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
          }}>
            <IconMountain size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Open<span className="gradient-text">Trip</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 6 }}>
            Masuk ke Akun Anda
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2.25rem' }}>
          <Suspense fallback={
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <IconSpinner size={24} />
            </div>
          }>
            <LoginForm />
          </Suspense>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Belum punya akun?{' '}
              <Link href="/register" style={{ color: 'var(--accent-indigo)', fontWeight: 700, textDecoration: 'none' }}>
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
