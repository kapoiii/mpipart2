'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { Trip, Equipment } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  IconSpinner,
  IconCompass,
  IconUsers,
  IconBackpack,
  IconReceipt,
  IconAlertCircle,
  IconCheck,
  IconMapPin,
  IconCalendar,
  IconClock
} from '@/components/icons'

export default function BookingPage() {
  const { id: tripId } = useParams() as { id: string }
  const { data: session, status } = useSession()
  const router = useRouter()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [totalPerson, setTotalPerson] = useState(1)
  const [selectedEquip, setSelectedEquip] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    async function load() {
      if (!tripId) return
      const [tripRes, equipRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch('/api/equipment'),
      ])
      if (tripRes.ok) setTrip(await tripRes.json())
      if (equipRes.ok) setEquipment(await equipRes.json())
      setLoading(false)
    }
    load()
  }, [tripId])

  const equipmentItems = Object.entries(selectedEquip)
    .filter(([, qty]) => qty > 0)
    .map(([equipmentId, qty]) => ({ equipmentId, qty }))

  const tripCost = trip ? Number(trip.price) * totalPerson : 0
  const equipCost = equipment.reduce((sum, eq) => {
    return sum + (selectedEquip[eq.id] || 0) * Number(eq.rental_price)
  }, 0)
  const totalCost = tripCost + equipCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, totalPerson, equipmentItems }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat booking')
        setSubmitting(false)
        return
      }

      router.push(`/booking/${data.id}/voucher`)
    } catch {
      setError('Terjadi kesalahan, coba lagi')
      setSubmitting(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <IconSpinner size={36} color="var(--accent-indigo)" />
          </div>
          <p style={{ fontWeight: 600 }}>Memuat data trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Trip tidak ditemukan</p>
    </div>
  )

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Formulir Pemesanan</h1>
        <p className="section-subtitle">{trip.title}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }} className="responsive-grid-detail">
          {/* Left: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Trip Info */}
            <div className="glass-card-solid" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCompass size={18} color="var(--accent-indigo)" /> Info Trip
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.885rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconMapPin size={15} color="var(--text-muted)" /> Lokasi
                  </span>
                  <span style={{ fontWeight: 600 }}>{trip.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.885rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconCalendar size={15} color="var(--text-muted)" /> Keberangkatan
                  </span>
                  <span style={{ fontWeight: 600 }}>{formatDate(trip.start_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.885rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconClock size={15} color="var(--text-muted)" /> Durasi
                  </span>
                  <span style={{ fontWeight: 600 }}>{trip.duration}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.885rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Harga / Orang</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>{formatRupiah(trip.price)}</span>
                </div>
              </div>
            </div>

            {/* Jumlah Peserta */}
            <div className="glass-card-solid" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconUsers size={18} color="var(--accent-indigo)" /> Jumlah Peserta
              </h2>
              <label className="input-label">Berapa orang yang ikut?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <button type="button" className="btn-secondary" style={{ width: 42, height: 42, padding: 0, justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                  onClick={() => setTotalPerson(Math.max(1, totalPerson - 1))}>−</button>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, minWidth: 40, textAlign: 'center' }}>{totalPerson}</span>
                <button type="button" className="btn-secondary" style={{ width: 42, height: 42, padding: 0, justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                  onClick={() => setTotalPerson(Math.min(10, totalPerson + 1))}>+</button>
              </div>
            </div>

            {/* Penyewaan Alat */}
            <div className="glass-card-solid" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconBackpack size={18} color="var(--accent-indigo)" /> Sewa Peralatan
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Opsional — pilih alat yang ingin disewa</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {equipment.map((eq) => (
                  <div key={eq.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1rem', borderRadius: 12,
                    background: selectedEquip[eq.id] ? 'rgba(79, 70, 229, 0.05)' : '#ffffff',
                    border: `1px solid ${selectedEquip[eq.id] ? 'rgba(79, 70, 229, 0.3)' : 'var(--border-light)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.885rem' }}>{eq.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-indigo)', marginTop: 2, fontWeight: 600 }}>
                        {formatRupiah(eq.rental_price)}/hari · Stok: {eq.stock}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" className="btn-secondary" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: 8, fontSize: '1rem', fontWeight: 700 }}
                        onClick={() => setSelectedEquip(prev => ({ ...prev, [eq.id]: Math.max(0, (prev[eq.id] || 0) - 1) }))}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{selectedEquip[eq.id] || 0}</span>
                      <button type="button" className="btn-secondary" style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: 8, fontSize: '1rem', fontWeight: 700 }}
                        onClick={() => setSelectedEquip(prev => ({ ...prev, [eq.id]: Math.min(eq.stock, (prev[eq.id] || 0) + 1) }))}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="glass-card-solid" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconReceipt size={18} color="var(--accent-indigo)" /> Ringkasan Pesanan
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Biaya Trip ({totalPerson} orang)</span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(tripCost)}</span>
                </div>
                {equipCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sewa Peralatan</span>
                    <span style={{ fontWeight: 600 }}>{formatRupiah(equipCost)}</span>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 0', borderTop: '1px solid var(--border-light)', marginBottom: '1.25rem',
              }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-indigo)', letterSpacing: '-0.02em' }}>
                  {formatRupiah(totalCost)}
                </span>
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: 10,
                  background: '#fee2e2', border: '1px solid #fca5a5',
                  color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <IconAlertCircle size={16} color="#b91c1c" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1, padding: '0.85rem' }}>
                {submitting ? (
                  <><IconSpinner size={16} /> Memproses...</>
                ) : (
                  <><IconCheck size={16} /> Konfirmasi Pesanan</>
                )}
              </button>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                Dengan memesan, kamu setuju dengan syarat & ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
