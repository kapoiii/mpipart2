'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  IconMountain,
  IconDashboard,
  IconCompass,
  IconBackpack,
  IconList,
  IconGlobe,
  IconLogout
} from '@/components/icons'

const navItems = [
  { href: '/admin/dashboard',    Icon: IconDashboard, label: 'Dashboard' },
  { href: '/admin/trips',        Icon: IconCompass,   label: 'Kelola Trip' },
  { href: '/admin/equipment',    Icon: IconBackpack,  label: 'Kelola Alat' },
  { href: '/admin/transactions', Icon: IconList,      label: 'Transaksi' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240, minHeight: '100vh', position: 'fixed', top: 0, left: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff',
          }}>
            <IconMountain size={18} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Open<span className="gradient-text">Trip</span>
          </span>
        </Link>
        <div style={{ marginTop: 6 }}>
          <span className="badge badge-admin" style={{ fontSize: '0.7rem' }}>Admin Panel</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const IconComponent = item.Icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.6rem 0.875rem',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                background: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                border: active ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <IconComponent size={18} color={active ? 'var(--accent-indigo)' : 'var(--text-secondary)'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-light)' }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0.6rem 0.875rem', borderRadius: 10,
          textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
          color: 'var(--text-secondary)',
        }}>
          <IconGlobe size={18} /> Lihat Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.6rem 0.875rem', borderRadius: 10, width: '100%',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 500, color: '#f43f5e',
            textAlign: 'left',
          }}
        >
          <IconLogout size={18} color="#f43f5e" /> Keluar
        </button>
      </div>
    </aside>
  )
}
