import { supabaseAdmin } from '@/lib/supabase'
import type { Trip } from '@/types'

export async function getTripsData(search?: string): Promise<Trip[]> {
  try {
    let query = supabaseAdmin
      .from('trips')
      .select(`*, itineraries(*)`)
      .order('start_date', { ascending: true })

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`)
    }

    const { data: trips, error } = await query

    if (error) {
      console.error('[getTripsData] Supabase error:', error.message)
      return []
    }

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

    return tripsWithQuota as Trip[]
  } catch (err) {
    console.error('[getTripsData] Unexpected error:', err)
    return []
  }
}

export async function getTripData(id: string): Promise<Trip | null> {
  try {
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .select(`*, itineraries(*)`)
      .eq('id', id)
      .single()

    if (error || !trip) return null

    const { count } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', id)
      .eq('status', 'CONFIRMED')

    return { ...trip, _bookingsCount: count || 0 } as Trip
  } catch (err) {
    console.error('[getTripData] Unexpected error:', err)
    return null
  }
}

