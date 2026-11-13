'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Booking } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  IconSpinner,
  IconReceipt,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconCompass,
  IconCreditCard
} from '@/components/icons'

export default function MyBookingsPage() {
  const { status } = useSession()
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchBookings(showLoading = true) {
      try {
        if (showLoading) setLoading(true)
        const res = await fetch(`/api/bookings?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setBookings(data)
        }
      } catch (err) {
        console.error('Failed to load bookings:', err)
      } finally {
        if (showLoading) setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchBookings(true)
      const interval = setInterval(() => {
        fetchBookings(false)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [status])

  if (loading || status === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <IconSpinner size={36} color="var(--accent-indigo)" />
          </div>
          <p style={{ fontWeight: 600 }}>Memuat pesanan Anda...</p>
        </div>
      </div>
    )
  }

  const statusMap: Record<string, { label: string; cls: string; IconComponent: React.ComponentType<{ size?: number }> }> = {
    PENDING: { label: 'Menunggu Pembayaran', cls: 'badge-pending', IconComponent: IconClock },
    CONFIRMED: { label: 'Dikonfirmasi', cls: 'badge-confirmed', IconComponent: IconCheck },
    CANCELLED: { label: 'Dibatalkan', cls: 'badge-cancelled', IconComponent: IconAlertCircle },
  }

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title">Pesanan Saya</h1>
        <p className="section-subtitle">Daftar riwayat dan status pemesanan open trip Anda</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(79, 70, 229, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconReceipt size={32} color="var(--accent-indigo)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Belum Ada Pesanan
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Anda belum pernah melakukan pemesanan paket trip. Temukan destinasi petualangan impian Anda sekarang!
          </p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            <IconCompass size={18} color="#ffffff" /> Jelajahi Katalog Trip
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((booking) => {
            const trip = booking.trip as { title?: string; location?: string; start_date?: string; duration?: string; image?: string } | undefined
            const statusInfo = statusMap[booking.status] || statusMap.PENDING
            const StatusIcon = statusInfo.IconComponent

            return (
              <div key={booking.id} className="glass-card-solid card-hover" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Trip Thumbnail */}
                {trip?.image && (
                  <div style={{ position: 'relative', width: 140, height: 100, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <Image
                      src={trip.image}
                      alt={trip.title || 'Trip'}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-indigo)', fontWeight: 700, letterSpacing: '0.04em' }}>
                      KODE: {booking.code}
                    </span>
                    <span className={`badge ${statusInfo.cls}`} style={{ fontSize: '0.78rem' }}>
                      <StatusIcon size={12} /> {statusInfo.label}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {trip?.title || 'Open Trip'}
                  </h3>

                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {trip?.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconMapPin size={14} color="var(--text-muted)" /> {trip.location}
                      </span>
                    )}
                    {trip?.start_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconCalendar size={14} color="var(--text-muted)" /> {formatDate(trip.start_date)}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconUsers size={14} color="var(--text-muted)" /> {booking.total_person} Peserta
                    </span>
                  </div>
                </div>

                {/* Price & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Biaya</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
                      {formatRupiah(booking.total_price)}
                    </div>
                  </div>

                  <Link href={`/booking/${booking.id}/voucher`} className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.1rem', fontSize: '0.82rem' }}>
                    <IconCreditCard size={14} /> Voucher & Pembayaran
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
