import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Trip } from '@/types'
import { formatRupiah, formatDate, calcRemainingQuota } from '@/lib/utils'
import { IconMapPin, IconClock, IconCalendar, IconUsers, IconCheck, IconCompass } from '@/components/icons'
import { getTripData } from '@/lib/trips'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const trip = await getTripData(id)
  return {
    title: trip ? `${trip.title}` : 'Trip Tidak Ditemukan',
    description: trip?.description || '',
  }
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await getTripData(id)
  if (!trip) notFound()

  const remaining = calcRemainingQuota(trip.quota, trip._bookingsCount || 0)
  const isFull = remaining === 0

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Image */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
          priority
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
        }} />
        <div className="page-container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#ffffff', fontSize: '0.82rem', fontWeight: 600,
                padding: '0.35rem 0.85rem', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <IconMapPin size={14} color="#a5b4fc" /> {trip.location}
              </span>
              <span style={{
                background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#ffffff', fontSize: '0.82rem', fontWeight: 600,
                padding: '0.35rem 0.85rem', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <IconClock size={14} color="#a5b4fc" /> {trip.duration}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#ffffff', maxWidth: 680, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {trip.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }} className="responsive-grid-detail">
          {/* Left: Details */}
          <div>
            {/* Description */}
            <div className="glass-card-solid" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>Tentang Trip</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.92rem' }}>{trip.description}</p>
            </div>

            {/* Itinerary */}
            {trip.itineraries && trip.itineraries.length > 0 && (
              <div className="glass-card-solid" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconCalendar size={20} color="var(--accent-indigo)" /> Itinerary Perjalanan
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {trip.itineraries
                    .sort((a, b) => a.day_number - b.day_number)
                    .map((it) => (
                      <div key={it.id} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                        <div style={{
                          minWidth: 42, height: 42, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.85rem', color: 'white', flexShrink: 0,
                          boxShadow: '0 3px 10px rgba(79, 70, 229, 0.25)',
                        }}>
                          H{it.day_number}
                        </div>
                        <div style={{ paddingTop: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-indigo)', marginBottom: 3, letterSpacing: '0.02em' }}>
                            HARI {it.day_number}
                          </div>
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{it.activity}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="glass-card-solid" style={{ padding: '1.75rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Harga per orang</div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-indigo)', letterSpacing: '-0.02em' }}>
                  {formatRupiah(trip.price)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 14, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconCalendar size={15} color="var(--text-muted)" /> Keberangkatan
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatDate(trip.start_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconUsers size={15} color="var(--text-muted)" /> Kuota Total
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{trip.quota} peserta</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconCheck size={15} color="var(--text-muted)" /> Sisa Kuota
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: remaining <= 5 ? '#d97706' : '#10b981' }}>
                    {remaining} slot
                  </span>
                </div>
              </div>

              {isFull ? (
                <div style={{
                  textAlign: 'center', padding: '0.85rem',
                  background: '#fee2e2', borderRadius: 9999,
                  border: '1px solid #fca5a5',
                  color: '#b91c1c', fontWeight: 700, fontSize: '0.9rem',
                }}>
                  Kuota Penuh
                </div>
              ) : (
                <Link href={`/booking/${trip.id}`} className="btn-primary" style={{
                  width: '100%', textDecoration: 'none',
                  justifyContent: 'center', fontSize: '0.95rem', padding: '0.85rem',
                }}>
                  <IconCompass size={18} color="#ffffff" /> Pesan Sekarang
                </Link>
              )}

              <p style={{
                fontSize: '0.78rem', color: 'var(--text-muted)',
                textAlign: 'center', marginTop: '1rem', lineHeight: 1.5,
              }}>
                Pembayaran aman via Midtrans — QRIS, VA, E-Wallet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
