import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import AdminSidebar from '@/components/AdminSidebar'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin Panel — OpenTrip',
  description: 'Sistem Pengelolaan Paket Open Trip, Alat Sewa, dan Transaksi Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <AdminSidebar />
        <div style={{
          flex: 1,
          marginLeft: 240,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>
          <main style={{ flex: 1, padding: '2rem 2.5rem' }}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
