import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/bookings/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      user:users(id, name, email),
      trip:trips(id, title, location, start_date, duration, image, price),
      equipments:booking_equipment(*, equipment:equipment(id, name))
    `)
    .eq('id', id)
    .single()

  if (error || !booking) return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })

  // Non-admin hanya bisa lihat booking sendiri
  const isAdmin = (session.user as { role: string }).role === 'ADMIN'
  if (!isAdmin && booking.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(booking)
}

// PATCH /api/bookings/[id] — admin update status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as { role: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status, snap_token } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status, ...(snap_token ? { snap_token } : {}) })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
