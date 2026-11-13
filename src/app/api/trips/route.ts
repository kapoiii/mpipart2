import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'

// GET /api/trips — list all trips with remaining quota
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  let query = supabaseAdmin
    .from('trips')
    .select(`*, itineraries(*)`)
    .order('start_date', { ascending: true })

  if (search) {
    query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`)
  }

  const { data: trips, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach confirmed bookings count for quota calculation
  const tripsWithQuota = await Promise.all(
    (trips || []).map(async (trip) => {
      const { count } = await supabaseAdmin
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', trip.id)
        .eq('status', 'CONFIRMED')
      return { ...trip, _bookingsCount: count || 0 }
    })
  )

  return NextResponse.json(tripsWithQuota)
}

// POST /api/trips — create trip (admin only)
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, location, price, quota, start_date, duration, image, description, itineraries } = body

  const { data: trip, error } = await supabaseAdmin
    .from('trips')
    .insert({ title, location, price, quota, start_date, duration, image, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (itineraries && itineraries.length > 0) {
    const itin = itineraries.map((it: { day_number: number; activity: string }) => ({
      trip_id: trip.id,
      day_number: it.day_number,
      activity: it.activity,
    }))
    await supabaseAdmin.from('itineraries').insert(itin)
  }

  return NextResponse.json(trip, { status: 201 })
}
