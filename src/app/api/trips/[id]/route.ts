import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'

// GET /api/trips/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: trip, error } = await supabaseAdmin
    .from('trips')
    .select(`*, itineraries(*)`)
    .eq('id', id)
    .single()

  if (error || !trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  const { count } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('trip_id', id)
    .eq('status', 'CONFIRMED')

  return NextResponse.json({ ...trip, _bookingsCount: count || 0 })
}

// PUT /api/trips/[id] — admin only
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as { role: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { itineraries, ...tripData } = body

  const { data: trip, error } = await supabaseAdmin
    .from('trips')
    .update(tripData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (itineraries) {
    await supabaseAdmin.from('itineraries').delete().eq('trip_id', id)
    if (itineraries.length > 0) {
      await supabaseAdmin.from('itineraries').insert(
        itineraries.map((it: { day_number: number; activity: string }) => ({
          trip_id: id,
          day_number: it.day_number,
          activity: it.activity,
        }))
      )
    }
  }

  return NextResponse.json(trip)
}

// DELETE /api/trips/[id] — admin only
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as { role: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { error } = await supabaseAdmin.from('trips').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
