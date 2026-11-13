import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import '../globals.css'

export const metadata: Metadata = {
  title: 'OpenTrip — Paket Wisata & Open Trip',
  description: 'Temukan dan pesan paket open trip pendakian gunung & wisata alam terbaik.',
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="w-full min-h-screen">
        {children}
      </main>
    </SessionProvider>
  )
}
