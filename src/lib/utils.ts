/** Format angka ke Rupiah */
export function formatRupiah(amount: number | string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

/** Format tanggal ke format Indonesia */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/** Generate kode booking unik: OT-YYYYMMDD-XXXX */
export function generateBookingCode(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `OT-${dateStr}-${random}`
}

/** Buat URL WhatsApp click-to-chat */
export function buildWaUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

/** Hitung sisa kuota trip */
export function calcRemainingQuota(quota: number, confirmedBookings: number): number {
  return Math.max(0, quota - confirmedBookings)
}

/** Truncate teks */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}
