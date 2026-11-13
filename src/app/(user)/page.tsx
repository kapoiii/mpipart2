import type { Metadata } from 'next'
import Link from 'next/link'
import TripCard from '@/components/TripCard'
import GlobeSlider from '@/components/GlobeSlider'
import type { Trip } from '@/types'
import {
  IconSearch,
  IconSparkles,
  IconBadgeCheck,
  IconClock,
  IconCompass,
  IconMapPin,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Katalog Open Trip | OpenTrip',
  description:
    'Jelajahi ratusan paket open trip pendakian gunung dan wisata alam terbaik dengan sistem pemesanan modern.',
}

async function getTrips(search?: string): Promise<Trip[]> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const url = `${baseUrl}/api/trips${search ? `?search=${search}` : ''}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch (e) {
    return []
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const trips = await getTrips(search)

  return (
    <div className="dark-theme-wrapper w-full bg-[#0b0f19] text-white min-h-screen">
      {/* 1. Hero Slider dengan UI Video Globe Express, sepenuhnya ditenagai Data Trip dari Database */}
      <GlobeSlider trips={trips} />

      {/* 3. Katalog Paket Open Trip (Database) */}
      <section id="catalog-section" className="py-20 max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
              <IconBadgeCheck size={16} color="#f59e0b" /> Paket Siap Berangkat
            </span>
            <h2
              className="font-display font-extrabold text-3xl md:text-5xl uppercase tracking-tight text-white"
              style={{ color: '#ffffff' }}
            >
              {search ? `Pencarian: "${search}"` : 'Katalog Open Trip'}
            </h2>
          </div>
          <p className="text-slate-300 text-sm mt-3 md:mt-0 font-medium" style={{ color: '#cbd5e1' }}>
            Tersedia {trips.length} paket siap dipesan
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md p-16 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <IconSearch size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ color: '#ffffff' }}>
              Trip tidak ditemukan
            </h3>
            <p className="text-slate-300 text-sm mb-6" style={{ color: '#cbd5e1' }}>
              Tidak ada paket yang cocok dengan kata kunci &quot;{search}&quot;. Coba cari gunung lain atau reset pencarian.
            </p>
            <Link
              href="/#catalog-section"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Tampilkan Semua Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Fitur & Keamanan */}
      <section id="about-section" className="about-features-container">
        <div className="page-container" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 3.5rem' }}>
            <span style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Standar Profesional & Keamanan
            </span>
            <h2
              className="font-display"
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                margin: '0.6rem 0 1rem',
                lineHeight: 1.15,
              }}
            >
              Kenapa Memilih OpenTrip?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              Setiap pendakian didampingi oleh pemandu profesional dengan logistik terstandarisasi untuk menjamin keselamatan dan kenyamanan Anda.
            </p>
          </div>

          <div className="about-features-grid">
            {[
              {
                icon: <IconBadgeCheck size={30} color="#f59e0b" />,
                title: 'Pemandu Berlisensi BNSP',
                desc: 'Didampingi guide berpengalaman dengan sertifikasi navigasi darat & pertolongan pertama (First Aid) di medan alam terbuka.',
              },
              {
                icon: <IconSparkles size={30} color="#f59e0b" />,
                title: 'Perlengkapan Lengkap',
                desc: 'Tersedia opsi sewa tenda dome, carrier, sleeping bag hangat, kompor portable, dan konsumsi bergizi selama pendakian.',
              },
              {
                icon: <IconClock size={30} color="#f59e0b" />,
                title: 'Pembayaran Instan & Otomatis',
                desc: 'Pembayaran terverifikasi otomatis via Midtrans (QRIS, VA, Kartu Kredit) dengan bukti booking & voucher langsung ke WhatsApp.',
              },
            ].map((item, idx) => (
              <div key={idx} className="about-feature-card">
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, margin: '1.25rem 0 0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer Bersih, Rapi & Tidak Tumpang Tindih */}
      <footer id="contact-section" className="site-footer">
        <div className="site-footer-inner">
          {/* Top Section */}
          <div className="site-footer-top">
            {/* Brand Column */}
            <div className="site-footer-brand">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: '1px solid rgba(245, 158, 11, 0.6)',
                  background: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)',
                }}>
                  <IconCompass size={20} color="#f59e0b" />
                </div>
                <span className="font-display" style={{ fontWeight: 800, fontSize: '1.45rem', letterSpacing: '0.05em', color: '#ffffff', textTransform: 'uppercase' }}>
                  OPEN<span style={{ color: '#f59e0b' }}>TRIP</span>
                </span>
              </Link>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1rem' }}>
                Platform pemesanan paket open trip pendakian gunung dan ekspedisi alam terbaik di Indonesia. Memberikan pengalaman mendaki yang aman, nyaman, dan berkesan.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                <span>Layanan Aktif 24/7 · Midtrans Verified</span>
              </div>
            </div>

            {/* Links Columns */}
            <div className="site-footer-links-group">
              <div className="site-footer-col">
                <h4>Navigasi</h4>
                <ul>
                  <li><Link href="/">Beranda</Link></li>
                  <li><Link href="/#catalog-section">Katalog Trip</Link></li>
                  <li><Link href="/my-bookings">Pesanan Saya</Link></li>
                  <li><Link href="/#about-section">Tentang Kami</Link></li>
                </ul>
              </div>

              <div className="site-footer-col">
                <h4>Destinasi</h4>
                <ul>
                  <li><Link href="/?search=Rinjani#catalog-section">Gunung Rinjani</Link></li>
                  <li><Link href="/?search=Bromo#catalog-section">Gunung Bromo</Link></li>
                  <li><Link href="/?search=Prau#catalog-section">Gunung Prau</Link></li>
                  <li><Link href="/#catalog-section">Semua Gunung</Link></li>
                </ul>
              </div>

              <div className="site-footer-col">
                <h4>Kontak & Bantuan</h4>
                <ul>
                  <li style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 6 }}>WA:</span>
                    +62 812-3456-7890
                  </li>
                  <li style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 6 }}>Email:</span>
                    support@opentrip.id
                  </li>
                  <li style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 6 }}>Lokasi:</span>
                    Indonesia
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Section */}
          <div className="site-footer-bottom">
            <span>&copy; {new Date().getFullYear()} OpenTrip Indonesia. All rights reserved.</span>
            <span style={{ color: '#64748b' }}>Platform Pendakian & Ekspedisi Terpercaya</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
