import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { generateBookingCode } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const bookingSchema = z.object({
  tripId: z.string().uuid(),
  totalPerson: z.number().int().min(1).max(20),
  equipmentItems: z.array(z.object({
    equipmentId: z.string().uuid(),
    qty: z.number().int().min(1),
  })).optional().default([]),
})

// GET /api/bookings — list bookings (admin: all, user: own)
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = (session.user as { role: string }).role === 'ADMIN'

  let query = supabaseAdmin
    .from('bookings')
    .select(`
      *,
      user:users(id, name, email),
      trip:trips(id, title, location, start_date, duration, image),
      equipments:booking_equipment(*, equipment:equipment(id, name))
    `)
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/bookings — create booking
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { tripId, totalPerson, equipmentItems } = parsed.data

  // Fetch trip + check quota
  const { data: trip } = await supabaseAdmin
    .from('trips')
    .select('id, price, quota')
    .eq('id', tripId)
    .single()

  if (!trip) return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 })

  const { count: confirmedCount } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('trip_id', tripId)
    .eq('status', 'CONFIRMED')

  const remaining = trip.quota - (confirmedCount || 0)
  if (totalPerson > remaining) {
    return NextResponse.json({ error: `Kuota tidak cukup. Sisa: ${remaining}` }, { status: 400 })
  }

  // Calculate total price
  let totalPrice = Number(trip.price) * totalPerson

  // Add equipment cost
  const equipPrices: { equipmentId: string; qty: number; pricePerItem: number }[] = []
  for (const item of equipmentItems) {
    const { data: eq } = await supabaseAdmin
      .from('equipment')
      .select('rental_price, stock')
      .eq('id', item.equipmentId)
      .single()

    if (!eq) continue
    if (eq.stock < item.qty) {
      return NextResponse.json({ error: `Stok alat tidak cukup` }, { status: 400 })
    }

    totalPrice += Number(eq.rental_price) * item.qty
    equipPrices.push({
      equipmentId: item.equipmentId,
      qty: item.qty,
      pricePerItem: Number(eq.rental_price),
    })
  }

  // Create booking
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      user_id: session.user.id,
      trip_id: tripId,
      code: generateBookingCode(),
      total_person: totalPerson,
      total_price: totalPrice,
      status: 'PENDING',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert booking equipment
  if (equipPrices.length > 0) {
    await supabaseAdmin.from('booking_equipment').insert(
      equipPrices.map((e) => ({
        booking_id: booking.id,
        equipment_id: e.equipmentId,
        qty: e.qty,
        price_per_item: e.pricePerItem,
      }))
    )
  }

  return NextResponse.json(booking, { status: 201 })
}
