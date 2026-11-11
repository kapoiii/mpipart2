'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { IconMountain, IconSettings, IconList, IconUser, IconLogout, IconCompass } from '@/components/icons'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN'

  return (
    <nav style={{
      position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-light)',
    }}>
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
          }}>
            <IconMountain size={20} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Open<span className="gradient-text">Trip</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600 }}>
            Katalog Trip
          </Link>

          {session ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard" className="badge badge-admin" style={{ textDecoration: 'none', padding: '0.45rem 0.95rem' }}>
                  <IconSettings size={14} /> Dashboard Admin
                </Link>
              )}
              <Link href="/my-bookings" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Pesanan Saya
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-light)' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800, color: 'white',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)',
                }}>
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>{session.user?.name}</span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-secondary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}>
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.55rem 1.35rem', fontSize: '0.88rem' }}>Masuk</Link>
              <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.55rem 1.35rem', fontSize: '0.88rem' }}>Daftar</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
          style={{
            display: 'none',
            background: 'none', border: 'none', fontSize: '1.2rem',
            color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        }}>
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCompass size={18} color="var(--accent-indigo)" /> Katalog Trip
          </Link>
          {session ? (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#6d28d9', textDecoration: 'none', fontWeight: 700, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconSettings size={18} color="#6d28d9" /> Dashboard Admin
                </Link>
              )}
              <Link href="/my-bookings" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconList size={18} color="var(--accent-blue)" /> Pesanan Saya
              </Link>
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconUser size={16} /> {session.user?.name}
                </span>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ justifyContent: 'center', textDecoration: 'none' }}>Masuk</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
