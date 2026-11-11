'use client'

import { useEffect, useState } from 'react'
import { Equipment } from '@/types'
import { formatRupiah } from '@/lib/utils'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBackpack,
  IconSpinner,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconSearch
} from '@/components/icons'

export default function AdminEquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null)

  const [name, setName] = useState('')
  const [rentalPrice, setRentalPrice] = useState<number | string>('')
  const [stock, setStock] = useState<number | string>('')

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/equipment')
      if (res.ok) {
        const data = await res.json()
        setEquipments(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleOpenCreateModal = () => {
    setEditingEquipment(null)
    setName('')
    setRentalPrice('')
    setStock('')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: Equipment) => {
    setEditingEquipment(item)
    setName(item.name)
    setRentalPrice(item.rental_price)
    setStock(item.stock)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name || rentalPrice === '' || stock === '') {
      setFormError('Harap isi semua kolom')
      return
    }

    setSubmitting(true)
    const payload = {
      name,
      rental_price: Number(rentalPrice),
      stock: Number(stock),
    }

    try {
      const url = editingEquipment ? `/api/equipment/${editingEquipment.id}` : '/api/equipment'
      const method = editingEquipment ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menyimpan peralatan')
      }

      showToast(editingEquipment ? 'Alat berhasil diperbarui!' : 'Alat baru berhasil ditambahkan!')
      setIsModalOpen(false)
      fetchEquipment()
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!equipmentToDelete) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/equipment/${equipmentToDelete.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus alat')
      }
      showToast(`Alat "${equipmentToDelete.name}" berhasil dihapus`)
      setIsDeleteModalOpen(false)
      setEquipmentToDelete(null)
      fetchEquipment()
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus alat', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredEquipments = equipments.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Kelola Master Alat Sewa
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 }}>
            Manajemen stok dan tarif sewa perlengkapan pendakian gunung.
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn-primary">
          <IconPlus size={18} />
          <span>Tambah Alat Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <IconSearch size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Cari nama peralatan..."
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <IconSpinner size={32} color="var(--accent-indigo)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Memuat data peralatan...</p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <IconBackpack size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Belum ada data peralatan</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Peralatan</th>
                <th>Harga Sewa / Unit</th>
                <th>Stok Ketersediaan</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</td>
                  <td style={{ color: 'var(--accent-indigo)', fontWeight: 700 }}>{formatRupiah(item.rental_price)}</td>
                  <td>
                    <span className={`badge ${item.stock > 0 ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {item.stock > 0 ? `${item.stock} Unit Tersedia` : 'Stok Habis'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        style={{
                          padding: '0.45rem', borderRadius: 8, border: '1px solid rgba(79, 70, 229, 0.2)',
                          background: 'rgba(79, 70, 229, 0.08)', cursor: 'pointer', color: 'var(--accent-indigo)'
                        }}
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        onClick={() => { setEquipmentToDelete(item); setIsDeleteModalOpen(true) }}
                        style={{
                          padding: '0.45rem', borderRadius: 8, border: '1px solid rgba(244, 63, 94, 0.2)',
                          background: 'rgba(244, 63, 94, 0.08)', cursor: 'pointer', color: '#f43f5e'
                        }}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, background: '#ffffff', borderRadius: 20, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingEquipment ? 'Edit Peralatan' : 'Tambah Peralatan Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <IconX size={20} color="var(--text-muted)" />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="input-label">Nama Peralatan *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: Tenda Dome 4 Person"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Harga Sewa Per Unit (IDR) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="50000"
                  value={rentalPrice}
                  onChange={e => setRentalPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">Stok Ketersediaan *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="10"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <IconSpinner size={16} /> : (editingEquipment ? 'Simpan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && equipmentToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 440, background: '#ffffff', borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Hapus Peralatan?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 8 }}>
              Yakin ingin menghapus <strong>"{equipmentToDelete.name}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? <IconSpinner size={16} /> : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
