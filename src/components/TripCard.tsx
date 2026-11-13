import Link from 'next/link'
import Image from 'next/image'
import type { Trip } from '@/types'
import { formatRupiah, formatDate, calcRemainingQuota } from '@/lib/utils'
import { IconMapPin, IconClock, IconLightning, IconCheck } from '@/components/icons'

interface TripCardProps {
  trip: Trip & { _bookingsCount?: number }
}

export default function TripCard({ trip }: TripCardProps) {
  const remaining = calcRemainingQuota(trip.quota, trip._bookingsCount || 0)
  const isFull = remaining === 0
  const isAlmostFull = remaining > 0 && remaining <= 5

  return (
    <Link href={`/trips/${trip.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="glass-card gemini-card-hover" style={{
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
          <Image
            src={trip.image}
            alt={trip.title}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          {/* Subtle gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(7, 9, 14, 0.85) 0%, rgba(7, 9, 14, 0.15) 60%, transparent 100%)',
          }} />
          
          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            {isFull ? (
              <span className="badge badge-cancelled">Kuota Penuh</span>
            ) : isAlmostFull ? (
              <span className="badge badge-pending">
                <IconLightning size={13} /> Sisa {remaining} Slot
              </span>
            ) : (
              <span className="badge badge-gemini">
                <IconCheck size={13} /> Tersedia ({remaining})
              </span>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
            <span style={{
              background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600,
              padding: '0.3rem 0.75rem', borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'inline-flex', alignItems: 'center', gap: 5
            }}>
              <IconClock size={13} color="var(--text-secondary)" /> {trip.duration}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <IconMapPin size={14} color="#6366f1" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{trip.location}</span>
            </div>

            <h3 style={{
              fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
              marginBottom: '1rem', lineHeight: 1.35, letterSpacing: '-0.015em'
            }}>
              {trip.title}
            </h3>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>Harga per pax</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                {formatRupiah(trip.price)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2, fontWeight: 500 }}>Keberangkatan</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {formatDate(trip.start_date)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
