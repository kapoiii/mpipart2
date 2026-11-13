'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { Booking } from '@/types'
import { formatRupiah, formatDate, buildWaUrl } from '@/lib/utils'
import {
  IconSpinner,
  IconBadgeCheck,
  IconAlertCircle,
  IconReceipt,
  IconCompass,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconUser,
  IconUsers,
  IconBackpack,
  IconCreditCard,
  IconCheck
} from '@/components/icons'

declare global {
  interface Window { snap: { pay: (token: string, opts: unknown) => void } }
}

export default function VoucherPage() {
  const { id } = useParams() as { id: string }
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)

  const loadBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${id}?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooking()
  }, [id])

  // Polling for status updates if pending
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (booking?.status === 'PENDING') {
      interval = setInterval(() => {
        loadBooking()
      }, 2000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [booking?.status, id])

  // Load Midtrans Snap script
  useEffect(() => {
    if (!document.getElementById('midtrans-snap')) {
      const script = document.createElement('script')
      script.id = 'midtrans-snap'
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
      document.head.appendChild(script)
    }
  }, [])

  const handlePay = async () => {
    setPayLoading(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking?.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        alert(data.error || 'Gagal memuat popup pembayaran Midtrans')
        setPayLoading(false)
        return
      }

      window.snap.pay(data.token, {
        onSuccess: async () => {
          await fetch(`/api/bookings/${booking?.id}/confirm`, { method: 'POST' })
          await loadBooking()
          setPayLoading(false)
        },
        onPending: () => {
          loadBooking()
          setPayLoading(false)
        },
        onError: () => {
          alert('Pembayaran gagal')
          setPayLoading(false)
        },
        onClose: () => setPayLoading(false),
      })
    } catch {
      alert('Gagal memproses pembayaran')
      setPayLoading(false)
    }
  }

  const waMessage = booking
    ? `Halo Admin OpenTrip!\n\nSaya ingin mengkonfirmasi pemesanan saya:\n\n- Kode Booking: *${booking.code}*\n- Trip: *${(booking.trip as { title?: string })?.title || '-'}*\n- Nama: *${(booking.user as { name?: string })?.name || '-'}*\n- Peserta: *${booking.total_person} orang*\n- Total: *${formatRupiah(booking.total_price)}*\n\nMohon konfirmasinya. Terima kasih!`
    : ''

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <IconSpinner size={36} color="var(--accent-indigo)" />
        </div>
        <p style={{ fontWeight: 600 }}>Memuat voucher...</p>
      </div>
    </div>
  )

  if (!booking) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Booking tidak ditemukan</p>
    </div>
  )

  const statusMap: Record<string, { label: string; cls: string; IconComponent: React.ComponentType<{ size?: number }> }> = {
    PENDING: { label: 'Menunggu Pembayaran', cls: 'badge-pending', IconComponent: IconClock },
    CONFIRMED: { label: 'Dikonfirmasi', cls: 'badge-confirmed', IconComponent: IconCheck },
    CANCELLED: { label: 'Dibatalkan', cls: 'badge-cancelled', IconComponent: IconAlertCircle },
  }
  const statusInfo = statusMap[booking.status] || statusMap.PENDING
  const StatusIcon = statusInfo.IconComponent

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: 720 }}>
      {/* Success Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: booking.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : booking.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {booking.status === 'CONFIRMED' ? (
            <IconBadgeCheck size={36} color="#10b981" />
          ) : booking.status === 'CANCELLED' ? (
            <IconAlertCircle size={36} color="#ef4444" />
          ) : (
            <IconReceipt size={36} color="#4f46e5" />
          )}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
          {booking.status === 'CONFIRMED' ? 'Booking Dikonfirmasi!' : booking.status === 'CANCELLED' ? 'Booking Dibatalkan' : 'Booking Berhasil Dibuat!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          {booking.status === 'PENDING' ? 'Selesaikan pembayaran untuk mengamankan slot Anda' : 'Terima kasih, pembayaran Anda telah berhasil diproses.'}
        </p>
      </div>

      {/* Voucher Card */}
      <div className="glass-card-solid" style={{ padding: '2.25rem', marginBottom: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Kode Booking</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--accent-indigo)' }}>
              {booking.code}
            </div>
          </div>
          <span className={`badge ${statusInfo.cls}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
            <StatusIcon size={14} /> {statusInfo.label}
          </span>
        </div>

        {/* Divider dashed */}
        <div style={{ borderTop: '2px dashed var(--border-light)', margin: '1.5rem 0' }} />

        {/* Trip Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Trip', value: (booking.trip as { title?: string })?.title || '-', Icon: IconCompass },
            { label: 'Lokasi', value: (booking.trip as { location?: string })?.location || '-', Icon: IconMapPin },
            { label: 'Berangkat', value: (booking.trip as { start_date?: string })?.start_date ? formatDate((booking.trip as { start_date: string }).start_date) : '-', Icon: IconCalendar },
            { label: 'Durasi', value: (booking.trip as { duration?: string })?.duration || '-', Icon: IconClock },
            { label: 'Pemesan', value: (booking.user as { name?: string })?.name || '-', Icon: IconUser },
            { label: 'Email', value: (booking.user as { email?: string })?.email || '-', Icon: IconUser },
            { label: 'Peserta', value: `${booking.total_person} orang`, Icon: IconUsers },
            { label: 'Dipesan Pada', value: formatDate(booking.created_at), Icon: IconCalendar },
          ].map(({ label, value, Icon }) => (
            <div key={label}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                <Icon size={13} color="var(--text-muted)" /> {label}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Equipment */}
        {booking.equipments && booking.equipments.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBackpack size={16} color="var(--accent-indigo)" /> Peralatan Disewa
            </div>
            {booking.equipments.map((be) => (
              <div key={be.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{(be.equipment as { name?: string })?.name} × {be.qty}</span>
                <span style={{ fontWeight: 600 }}>{formatRupiah(Number(be.price_per_item) * be.qty)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '1.25rem', borderTop: '2px solid var(--border-light)',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Pembayaran</span>
          <span style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--accent-indigo)', letterSpacing: '-0.02em' }}>
            {formatRupiah(booking.total_price)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        {booking.status === 'PENDING' && (
          <button onClick={handlePay} className="btn-primary" disabled={payLoading}
            style={{ width: '100%', maxWidth: 440, justifyContent: 'center', fontSize: '1rem', padding: '0.875rem' }}>
            {payLoading ? (
              <><IconSpinner size={18} /> Memuat Popup Pembayaran...</>
            ) : (
              <><IconCreditCard size={18} /> Bayar Sekarang (Midtrans)</>
            )}
          </button>
        )}

        <a
          href={buildWaUrl(process.env.NEXT_PUBLIC_ADMIN_WA || '6281234567890', waMessage)}
          target="_blank" rel="noopener noreferrer"
          className="btn-wa"
          style={{ width: '100%', maxWidth: 440, justifyContent: 'center', fontSize: '1rem', padding: '0.875rem' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Konfirmasi via WhatsApp
        </a>
      </div>
    </div>
  )
}
