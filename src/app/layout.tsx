import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'OpenTrip — Paket Wisata & Open Trip Terpercaya',
    template: '%s | OpenTrip',
  },
  description: 'Platform pemesanan open trip pendakian gunung, wisata alam, dan penyewaan peralatan outdoor terpercaya. Mudah, aman, dan terjangkau.',
  keywords: ['open trip', 'wisata alam', 'pendakian gunung', 'sewa peralatan outdoor'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
