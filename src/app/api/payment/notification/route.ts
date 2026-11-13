import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/payment/notification — Midtrans webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { order_id, transaction_status, fraud_status } = body

    // Extract base booking code (e.g., TRIP-123456 from TRIP-123456-9999)
    const bookingCode = typeof order_id === 'string' && order_id.includes('-')
      ? order_id.split('-').slice(0, 2).join('-')
      : order_id

    // Map Midtrans status → BookingStatus
    let status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = 'PENDING'

    if (transaction_status === 'capture') {
      status = fraud_status === 'accept' ? 'CONFIRMED' : 'CANCELLED'
    } else if (transaction_status === 'settlement') {
      status = 'CONFIRMED'
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      status = 'CANCELLED'
    } else if (transaction_status === 'pending') {
      status = 'PENDING'
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('code', bookingCode)

    if (error) {
      console.error('Notification update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err: any) {
    console.error('Midtrans notification error:', err)
    return NextResponse.json({ error: err.message || 'Notification error' }, { status: 500 })
  }
}
