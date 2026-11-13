'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  IconCompass,
  IconReceipt,
  IconUsers,
  IconClock,
  IconCheck,
  IconSpinner,
  IconPlus,
  IconBackpack,
  IconList
} from '@/components/icons'
import { Booking, Trip } from '@/types'

export default function AdminDashboardPage() {
  const [tripsCount, setTripsCount] = useState(0)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [tripsRes, bookingsRes] = await Promise.all([
          fetch('/api/trips'),
          fetch('/api/bookings'),
        ])

        if (tripsRes.ok) {
          const tripsData = await tripsRes.json()
          setTripsCount(tripsData.length)
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setBookings(bookingsData)
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED')
  const pendingBookings = bookings.filter(b => b.status === 'PENDING')
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.total_price), 0)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Dashboard Admin
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
          Ringkasan performa pemesanan, pendapatan, dan pengelolaan sistem OpenTrip.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem', marginBottom: '2rem'
      }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Pendapatan</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <IconReceipt size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>
            {formatRupiah(totalRevenue)}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Dari transaksi CONFIRMED</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Booking</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-indigo)' }}>
              <IconUsers size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>
            {bookings.length} Pesanan
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {confirmedBookings.length} Terkonfirmasi • {pendingBookings.length} Pending
          </span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Paket Wisata Active</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <IconCompass size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>
            {tripsCount} Paket
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Siap untuk dipesan</span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Menu Pintar Admin</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Link href="/admin/trips" className="glass-card card-hover" style={{ padding: '1.25rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconCompass size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Kelola Paket Open Trip</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Tambah, edit & hapus trip</div>
            </div>
          </Link>

          <Link href="/admin/equipment" className="glass-card card-hover" style={{ padding: '1.25rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconBackpack size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Kelola Master Alat Sewa</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Atur stok tenda, kompor, SB</div>
            </div>
          </Link>

          <Link href="/admin/transactions" className="glass-card card-hover" style={{ padding: '1.25rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #d97706, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconList size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Monitor Transaksi</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Pantau status & e-voucher</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pemesanan Terbaru</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>5 transaksi terakhir masuk ke sistem</p>
          </div>
          <Link href="/admin/transactions" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-indigo)', textDecoration: 'none' }}>
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <IconSpinner size={24} color="var(--accent-indigo)" />
          </div>
        ) : bookings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada pemesanan masuk.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode Booking</th>
                <th>Pemesan</th>
                <th>Trip</th>
                <th>Total Person</th>
                <th>Total Biaya</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>{b.code}</td>
                  <td>{b.user?.name || b.user?.email || 'Guest'}</td>
                  <td>{b.trip?.title || 'Trip'}</td>
                  <td>{b.total_person} Pax</td>
                  <td style={{ fontWeight: 700 }}>{formatRupiah(b.total_price)}</td>
                  <td>
                    <span className={`badge ${
                      b.status === 'CONFIRMED' ? 'badge-confirmed' :
                      b.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-pending'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
