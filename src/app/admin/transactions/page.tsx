'use client'

import { useEffect, useState } from 'react'
import { Booking } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  IconSearch,
  IconReceipt,
  IconSpinner,
  IconEye,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconCalendar,
  IconUser
} from '@/components/icons'

export default function AdminTransactionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL')

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchBookings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const res = await fetch(`/api/bookings?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(true)
    const interval = setInterval(() => {
      fetchBookings(false)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleUpdateStatus = async (id: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengubah status transaksi')
      }

      showToast(`Status booking berhasil diubah ke ${newStatus}`)
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null)
      }
      fetchBookings()
    } catch (err: any) {
      showToast(err.message || 'Gagal update status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.trip?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (statusFilter === 'ALL') return matchesSearch
    return matchesSearch && b.status === statusFilter
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '0.85rem 1.4rem', borderRadius: 12,
          background: toast.type === 'success' ? '#10b981' : '#f43f5e',
          color: '#ffffff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {toast.type === 'success' ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Kelola & Monitor Transaksi
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
          Pemantauan status pemesanan, konfirmasi manual, dan rincian e-voucher transaksi.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <IconSearch size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Cari kode booking, pemesan, atau nama trip..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
            {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600,
                  background: statusFilter === st ? '#ffffff' : 'transparent',
                  color: statusFilter === st ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                  boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {st === 'ALL' ? 'Semua Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <IconSpinner size={32} color="var(--accent-indigo)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Memuat data transaksi...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <IconReceipt size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tidak ada transaksi ditemukan</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Booking</th>
                  <th>Pemesan</th>
                  <th>Paket Trip</th>
                  <th>Jumlah Pax</th>
                  <th>Total Biaya</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 800, color: 'var(--accent-indigo)' }}>{b.code}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.user?.name || 'User'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                    </td>
                    <td>{b.trip?.title || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{b.total_person} Person</td>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatRupiah(b.total_price)}</td>
                    <td>
                      <span className={`badge ${
                        b.status === 'CONFIRMED' ? 'badge-confirmed' :
                        b.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-pending'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={() => { setSelectedBooking(b); setIsDetailModalOpen(true) }}
                          title="Lihat Detail Transaksi"
                          style={{
                            padding: '0.45rem', borderRadius: 8, border: '1px solid var(--border-light)',
                            background: '#ffffff', cursor: 'pointer', color: 'var(--text-secondary)'
                          }}
                        >
                          <IconEye size={16} />
                        </button>
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            disabled={updating}
                            style={{
                              padding: '0.35rem 0.75rem', borderRadius: 8, border: 'none',
                              background: '#10b981', color: '#ffffff', cursor: 'pointer',
                              fontSize: '0.78rem', fontWeight: 700
                            }}
                          >
                            Setujui
                          </button>
                        )}
                        {b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            disabled={updating}
                            style={{
                              padding: '0.35rem 0.65rem', borderRadius: 8, border: '1px solid #fca5a5',
                              background: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
                              fontSize: '0.78rem', fontWeight: 600
                            }}
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 560, background: '#ffffff', borderRadius: 20, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Detail Transaksi Booking</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Kode: <span style={{ fontWeight: 800, color: 'var(--accent-indigo)' }}>{selectedBooking.code}</span>
                </p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <IconX size={20} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pemesan:</span>
                <span style={{ fontWeight: 700 }}>{selectedBooking.user?.name || selectedBooking.user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontWeight: 600 }}>{selectedBooking.user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Paket Open Trip:</span>
                <span style={{ fontWeight: 700 }}>{selectedBooking.trip?.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Jumlah Pax:</span>
                <span style={{ fontWeight: 600 }}>{selectedBooking.total_person} Orang</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', borderTop: '1px solid var(--border-light)', paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 700 }}>Total Pembayaran:</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-indigo)' }}>{formatRupiah(selectedBooking.total_price)}</span>
              </div>
            </div>

            {selectedBooking.equipments && selectedBooking.equipments.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>Item Alat Sewa Tambahan:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedBooking.equipments.map(eq => (
                    <div key={eq.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '0.4rem 0.6rem', background: '#f1f5f9', borderRadius: 6 }}>
                      <span>{eq.equipment?.name || 'Alat'} x {eq.qty}</span>
                      <span style={{ fontWeight: 600 }}>{formatRupiah(eq.price_per_item * eq.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
