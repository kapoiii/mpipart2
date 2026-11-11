import type { Metadata } from 'next'
import TripCard from '@/components/TripCard'
import type { Trip } from '@/types'
import { IconSearch, IconSparkles, IconStar, IconBadgeCheck } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Katalog Open Trip | OpenTrip',
  description: 'Jelajahi ratusan paket open trip pendakian gunung dan wisata alam terbaik dengan sistem pemesanan modern.',
}

async function getTrips(search?: string): Promise<Trip[]> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const url = `${baseUrl}/api/trips${search ? `?search=${search}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const trips = await getTrips(search)

  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient" style={{ padding: '5.5rem 0 4.5rem', position: 'relative' }}>
        <div className="page-container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-up">
            <span className="badge badge-gemini" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(2, 132, 199, 0.1)' }}>
              <IconBadgeCheck size={16} color="var(--accent-blue)" /> Platform Open Trip Terpercaya
            </span>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5.2vw, 3.6rem)',
              fontWeight: 800, letterSpacing: '-0.035em',
              lineHeight: 1.15, marginBottom: '1.25rem',
            }}>
              Jelajahi Alam Bebas<br />
              <span className="gradient-text">Dengan Pengalaman Modern</span>
            </h1>
            <p style={{
              fontSize: '1.08rem', color: 'var(--text-secondary)',
              maxWidth: 540, margin: '0 auto 2.5rem',
              lineHeight: 1.7, fontWeight: 400
            }}>
              Temukan paket open trip pendakian gunung & wisata alam terbaik. Pembayaran instan & konfirmasi mudah via WhatsApp.
            </p>

            {/* Search Bar */}
            <form style={{ display: 'flex', gap: 10, maxWidth: 540, margin: '0 auto', justifyContent: 'center' }}>
              <div style={{
                position: 'relative', flex: 1, display: 'flex', alignItems: 'center',
              }}>
                <span style={{ position: 'absolute', left: 16, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <IconSearch size={18} />
                </span>
                <input
                  name="search"
                  defaultValue={search || ''}
                  placeholder="Cari destinasi, gunung, atau lokasi..."
                  className="input-field"
                  style={{
                    paddingLeft: '2.8rem', borderRadius: '9999px',
                    background: '#ffffff',
                    borderColor: 'var(--border-light)',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.7rem 1.8rem' }}>
                Cari Trip
              </button>
            </form>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '3.5rem',
            marginTop: '4rem', flexWrap: 'wrap',
          }}>
            {[
              { value: '100+', label: 'Paket Open Trip' },
              { value: '5.000+', label: 'Peserta Puas' },
              { value: '25+', label: 'Destinasi Gunung' },
              { value: '4.9 / 5', label: 'Rating Kepuasan' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-indigo)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trips Section */}
      <section style={{ padding: '3.5rem 0 6rem' }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 className="section-title">
                {search ? `Pencarian: "${search}"` : 'Katalog Open Trip Terbaru'}
              </h2>
              <p className="section-subtitle">{trips.length} paket siap untuk dipesan</p>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <IconSearch size={42} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8, fontWeight: 700 }}>Trip tidak ditemukan</h3>
              <p style={{ fontSize: '0.9rem' }}>Coba gunakan kata kunci pencarian yang berbeda</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}>
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
