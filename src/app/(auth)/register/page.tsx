'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconMountain, IconAlertCircle, IconSpinner } from '@/components/icons'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Pendaftaran gagal')
      setLoading(false)
    } else {
      router.push('/login?registered=true')
    }
  }

  return (
    <div className="hero-gradient" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative',
    }}>
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
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
            Buat Akun Petualang Baru
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2.25rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {[
              { id: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'John Doe', key: 'name' as const },
              { id: 'email', label: 'Alamat Email', type: 'email', placeholder: 'nama@email.com', key: 'email' as const },
              { id: 'password', label: 'Kata Sandi', type: 'password', placeholder: 'Minimal 6 karakter', key: 'password' as const },
            ].map(field => (
              <div key={field.id}>
                <label className="input-label" htmlFor={field.id}>{field.label}</label>
                <input
                  id={field.id}
                  type={field.type}
                  className="input-field"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  required
                />
              </div>
            ))}

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
                <><IconSpinner size={16} /> Mendaftar...</>
              ) : (
                'Buat Akun'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Sudah punya akun?{' '}
              <Link href="/login" style={{ color: 'var(--accent-indigo)', fontWeight: 700, textDecoration: 'none' }}>
                Masuk ke Akun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div >
  )
}
