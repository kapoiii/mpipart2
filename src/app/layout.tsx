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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
