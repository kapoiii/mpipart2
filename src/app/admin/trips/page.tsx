'use client'

import { useEffect, useState } from 'react'
import { Trip, Itinerary } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconCompass,
  IconCalendar,
  IconClock,
  IconUsers,
  IconSpinner,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconMapPin
} from '@/components/icons'

interface FormItinerary {
  day_number: number
  activity: string
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterQuota, setFilterQuota] = useState<'ALL' | 'AVAILABLE' | 'FULL'>('ALL')

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selected item states
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)

  // Loading & submit feedback
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState<number | string>('')
  const [quota, setQuota] = useState<number | string>('')
  const [startDate, setStartDate] = useState('')
  const [duration, setDuration] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [itineraries, setItineraries] = useState<FormItinerary[]>([
    { day_number: 1, activity: '' }
  ])

  // Fetch Trips
  const fetchTrips = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/trips')
      if (res.ok) {
        const data = await res.json()
        setTrips(data)
      }
    } catch (err) {
      console.error('Failed fetching trips', err)
      showToast('Gagal memuat daftar paket', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Reset & Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTrip(null)
    setTitle('')
    setLocation('')
    setPrice('')
    setQuota('')
    setStartDate('')
    setDuration('')
    setImage('')
    setDescription('')
    setItineraries([{ day_number: 1, activity: '' }])
    setFormError('')
    setIsFormModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = async (trip: Trip) => {
    setEditingTrip(trip)
    setTitle(trip.title)
    setLocation(trip.location)
    setPrice(trip.price)
    setQuota(trip.quota)
    
    // Format start_date to YYYY-MM-DD for input date field
    const dateFormatted = trip.start_date ? new Date(trip.start_date).toISOString().split('T')[0] : ''
    setStartDate(dateFormatted)
    setDuration(trip.duration)
    setImage(trip.image)
    setDescription(trip.description)
    setFormError('')

    // Fetch full trip detail with itineraries
    try {
      const res = await fetch(`/api/trips/${trip.id}`)
      if (res.ok) {
        const data: Trip = await res.json()
        if (data.itineraries && data.itineraries.length > 0) {
          const sorted = [...data.itineraries].sort((a, b) => a.day_number - b.day_number)
          setItineraries(sorted.map(it => ({ day_number: it.day_number, activity: it.activity })))
        } else {
          setItineraries([{ day_number: 1, activity: '' }])
        }
      }
    } catch (e) {
      console.error('Error fetching trip detail for edit', e)
    }

    setIsFormModalOpen(true)
  }

  // Open Detail Preview Modal
  const handleOpenDetailModal = async (trip: Trip) => {
    setSelectedTrip(trip)
    setIsDetailModalOpen(true)
    try {
      const res = await fetch(`/api/trips/${trip.id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedTrip(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (trip: Trip) => {
    setTripToDelete(trip)
    setIsDeleteModalOpen(true)
  }

  // Dynamic Itinerary Helpers
  const handleAddItineraryDay = () => {
    setItineraries(prev => [
      ...prev,
      { day_number: prev.length + 1, activity: '' }
    ])
  }

  const handleRemoveItineraryDay = (index: number) => {
    if (itineraries.length <= 1) return
    const updated = itineraries
      .filter((_, i) => i !== index)
      .map((it, idx) => ({ ...it, day_number: idx + 1 }))
    setItineraries(updated)
  }

  const handleItineraryActivityChange = (index: number, text: string) => {
    const updated = [...itineraries]
    updated[index].activity = text
    setItineraries(updated)
  }

  // Form Submission (Create or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!title || !location || !price || !quota || !startDate || !duration || !image || !description) {
      setFormError('Harap isi semua kolom wajib')
      return
    }

    // Filter valid itineraries
    const validItineraries = itineraries
      .filter(it => it.activity.trim() !== '')
      .map((it, idx) => ({ day_number: idx + 1, activity: it.activity.trim() }))

    setSubmitting(true)
    const payload = {
      title,
      location,
      price: Number(price),
      quota: Number(quota),
      start_date: startDate,
      duration,
      image,
      description,
      itineraries: validItineraries,
    }

    try {
      const url = editingTrip ? `/api/trips/${editingTrip.id}` : '/api/trips'
      const method = editingTrip ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Terjadi kesalahan saat menyimpan paket')
      }

      showToast(
        editingTrip ? 'Paket trip berhasil diperbarui!' : 'Paket trip baru berhasil ditambahkan!',
        'success'
      )
      setIsFormModalOpen(false)
      fetchTrips()
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan paket')
    } finally {
      setSubmitting(false)
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!tripToDelete) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/trips/${tripToDelete.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menghapus paket')
      }

      showToast(`Paket "${tripToDelete.title}" berhasil dihapus`, 'success')
      setIsDeleteModalOpen(false)
      setTripToDelete(null)
      fetchTrips()
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus paket', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Filtered trips list
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trip.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const bookingsCount = trip._bookingsCount || 0
    const isFull = bookingsCount >= trip.quota

    if (filterQuota === 'AVAILABLE') return matchesSearch && !isFull
    if (filterQuota === 'FULL') return matchesSearch && isFull
    return matchesSearch
  })

  // Summary Metrics
  const totalTrips = trips.length
  const totalBookedCount = trips.reduce((acc, trip) => acc + (trip._bookingsCount || 0), 0)
  const totalAvailableQuota = trips.reduce((acc, trip) => acc + Math.max(0, trip.quota - (trip._bookingsCount || 0)), 0)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '0.85rem 1.4rem', borderRadius: 12,
          background: toast.type === 'success' ? '#10b981' : '#f43f5e',
          color: '#ffffff', fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'success' ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', gap: '1rem', marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Kelola Paket Open Trip
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
            Manajemen daftar paket pendakian & wisata, harga, tanggal keberangkatan, dan itinerary.
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn-primary" style={{ padding: '0.75rem 1.4rem' }}>
          <IconPlus size={18} />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem', marginBottom: '2rem'
      }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Paket</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-indigo)' }}>
              <IconCompass size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalTrips}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Paket terdaftar di sistem</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Total Pesanan Terkonfirmasi</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <IconUsers size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalBookedCount} pax
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Status CONFIRMED</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Sisa Kuota Tersedia</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <IconCalendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalAvailableQuota} seat
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dari seluruh trip</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: 260 }}>
            <IconSearch size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Cari judul trip atau lokasi..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
            <button
              onClick={() => setFilterQuota('ALL')}
              style={{
                padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                background: filterQuota === 'ALL' ? '#ffffff' : 'transparent',
                color: filterQuota === 'ALL' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                boxShadow: filterQuota === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Semua Paket
            </button>
            <button
              onClick={() => setFilterQuota('AVAILABLE')}
              style={{
                padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                background: filterQuota === 'AVAILABLE' ? '#ffffff' : 'transparent',
                color: filterQuota === 'AVAILABLE' ? '#059669' : 'var(--text-secondary)',
                boxShadow: filterQuota === 'AVAILABLE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Kuota Tersedia
            </button>
            <button
              onClick={() => setFilterQuota('FULL')}
              style={{
                padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                background: filterQuota === 'FULL' ? '#ffffff' : 'transparent',
                color: filterQuota === 'FULL' ? '#b91c1c' : 'var(--text-secondary)',
                boxShadow: filterQuota === 'FULL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Kuota Penuh
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <IconSpinner size={32} color="var(--accent-indigo)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Memuat daftar paket trip...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <IconCompass size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tidak ada paket trip ditemukan</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Coba sesuaikan kata kunci pencarian atau tambah paket trip baru.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Detail Paket & Lokasi</th>
                  <th>Harga / Pax</th>
                  <th>Keberangkatan</th>
                  <th>Durasi</th>
                  <th>Kuota Terisi</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map(trip => {
                  const booked = trip._bookingsCount || 0
                  const isFull = booked >= trip.quota
                  return (
                    <tr key={trip.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={trip.image}
                            alt={trip.title}
                            style={{
                              width: 52, height: 52, borderRadius: 10, objectFit: 'cover',
                              background: '#f1f5f9', border: '1px solid var(--border-light)',
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {trip.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
                              <IconMapPin size={13} color="var(--text-muted)" />
                              <span>{trip.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-indigo)', fontSize: '0.95rem' }}>
                          {formatRupiah(trip.price)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                          <IconCalendar size={14} color="var(--text-muted)" />
                          <span>{formatDate(trip.start_date)}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                          <IconClock size={14} color="var(--text-muted)" />
                          <span>{trip.duration}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 110 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                            <span>{booked} / {trip.quota}</span>
                            <span style={{ color: isFull ? '#b91c1c' : '#047857' }}>
                              {isFull ? 'Penuh' : `${trip.quota - booked} sisa`}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, (booked / trip.quota) * 100)}%`,
                              height: '100%',
                              borderRadius: 99,
                              background: isFull ? '#ef4444' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleOpenDetailModal(trip)}
                            title="Lihat Detail Itinerary"
                            style={{
                              padding: '0.45rem', borderRadius: 8, border: '1px solid var(--border-light)',
                              background: '#ffffff', cursor: 'pointer', color: 'var(--text-secondary)',
                              transition: 'all 0.15s'
                            }}
                          >
                            <IconEye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(trip)}
                            title="Edit Paket"
                            style={{
                              padding: '0.45rem', borderRadius: 8, border: '1px solid rgba(79, 70, 229, 0.2)',
                              background: 'rgba(79, 70, 229, 0.08)', cursor: 'pointer', color: 'var(--accent-indigo)',
                              transition: 'all 0.15s'
                            }}
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(trip)}
                            title="Hapus Paket"
                            style={{
                              padding: '0.45rem', borderRadius: 8, border: '1px solid rgba(244, 63, 94, 0.2)',
                              background: 'rgba(244, 63, 94, 0.08)', cursor: 'pointer', color: '#f43f5e',
                              transition: 'all 0.15s'
                            }}
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== CREATE / EDIT MODAL ==================== */}
      {isFormModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto',
            background: '#ffffff', borderRadius: 20, padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {editingTrip ? 'Edit Paket Open Trip' : 'Tambah Paket Open Trip Baru'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Isi formulir di bawah ini untuk merilis atau memperbarui paket trip.
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 10, background: '#fee2e2',
                border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '0.875rem',
                marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <IconAlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Judul Trip *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Open Trip Gunung Rinjani"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Lokasi *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Lombok, NTB"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Harga (IDR) *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="1500000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Kuota (Pax) *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="15"
                    value={quota}
                    onChange={e => setQuota(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Tgl Keberangkatan *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Durasi *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="3 Hari 2 Malam"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Foto & Preview */}
              <div>
                <label className="input-label">URL Foto Sampul *</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                </div>
                {image && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={image}
                      alt="Preview"
                      style={{ width: 80, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-light)' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80'
                      }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Preview gambar sampul</span>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Deskripsi Lengkap *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Jelaskan daya tarik trip, fasilitas inklusif, titik kumpul, dll..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Dynamic Itinerary Section */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Rincian Itinerary Per Hari</label>
                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid var(--accent-indigo)',
                      background: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent-indigo)',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <IconPlus size={14} /> Tambah Hari
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {itineraries.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <div style={{
                        padding: '0.55rem 0.75rem', borderRadius: 8, background: '#f1f5f9',
                        fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)'
                      }}>
                        Hari {it.day_number}
                      </div>
                      <input
                        type="text"
                        className="input-field"
                        placeholder={`Kegiatan & rincian jadwal Hari ke-${it.day_number}`}
                        value={it.activity}
                        onChange={e => handleItineraryActivityChange(idx, e.target.value)}
                      />
                      {itineraries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(idx)}
                          style={{
                            padding: '0.55rem', borderRadius: 8, border: '1px solid #fee2e2',
                            background: '#fef2f2', color: '#f43f5e', cursor: 'pointer'
                          }}
                        >
                          <IconX size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? (
                    <><IconSpinner size={16} /> Menyimpan...</>
                  ) : (
                    editingTrip ? 'Simpan Perubahan' : 'Terbitkan Paket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DETAIL PREVIEW MODAL ==================== */}
      {isDetailModalOpen && selectedTrip && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
            background: '#ffffff', borderRadius: 20, padding: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Detail Paket Open Trip</h2>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <IconX size={20} color="var(--text-muted)" />
              </button>
            </div>

            <img
              src={selectedTrip.image}
              alt={selectedTrip.title}
              style={{ width: '100%', height: 220, borderRadius: 14, objectFit: 'cover', marginBottom: '1.25rem' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80'
              }}
            />

            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedTrip.title}</h3>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <IconMapPin size={16} color="var(--accent-indigo)" />
                {selectedTrip.location}
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem',
              padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '1.25rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HARGA / PAX</div>
                <div style={{ fontWeight: 800, color: 'var(--accent-indigo)', fontSize: '1.05rem', marginTop: 2 }}>
                  {formatRupiah(selectedTrip.price)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>KEBERANGKATAN</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 2 }}>
                  {formatDate(selectedTrip.start_date)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DURASI</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: 2 }}>
                  {selectedTrip.duration}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>Deskripsi Paket:</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedTrip.description}
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 10 }}>Itinerary Per Hari:</div>
              {selectedTrip.itineraries && selectedTrip.itineraries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedTrip.itineraries.sort((a,b) => a.day_number - b.day_number).map(it => (
                    <div key={it.id || it.day_number} style={{
                      padding: '0.75rem 1rem', borderRadius: 10, background: '#f1f5f9',
                      display: 'flex', gap: 12, alignItems: 'flex-start'
                    }}>
                      <span className="badge badge-admin" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        Hari {it.day_number}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {it.activity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Belum ada rincian itinerary terdaftar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {isDeleteModalOpen && tripToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: 460, background: '#ffffff', borderRadius: 20, padding: '2rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#fee2e2',
              color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <IconTrash size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hapus Paket Trip?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8, lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus paket <strong>"{tripToDelete.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'center' }}>
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Batal
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={submitting}
                style={{ flex: 1, justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? <IconSpinner size={16} /> : 'Ya, Hapus Paket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
