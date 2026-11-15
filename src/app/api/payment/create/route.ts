import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { snap } from '@/lib/midtrans'

// POST /api/payment/create — generate Midtrans Snap token
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bookingId } = await request.json()

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        user:users(id, name, email),
        trip:trips(id, title)
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
    if (booking.user_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (booking.status !== 'PENDING') return NextResponse.json({ error: 'Booking sudah diproses' }, { status: 400 })

    // Reuse existing snap_token if already generated
    if (booking.snap_token) {
      return NextResponse.json({ token: booking.snap_token, clientKey: process.env.MIDTRANS_CLIENT_KEY })
    }

    const orderId = `${booking.code}-${Date.now().toString().slice(-4)}`

    const origin =
      request.headers.get('origin') ||
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000')

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(Number(booking.total_price)),
      },
      customer_details: {
        first_name: booking.user?.name || 'Customer',
        email: booking.user?.email || 'customer@example.com',
      },
      item_details: [
        {
          id: booking.trip_id,
          name: (booking.trip?.title || 'Open Trip').slice(0, 50),
          price: Math.round(Number(booking.total_price)),
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${origin}/booking/${booking.id}/voucher`,
      },
    }

    const token = await snap.createTransactionToken(parameter)

    // Save snap token to booking
    await supabaseAdmin
      .from('bookings')
      .update({ snap_token: token })
      .eq('id', bookingId)

    return NextResponse.json({ token, clientKey: process.env.MIDTRANS_CLIENT_KEY })
  } catch (err: any) {
    console.error('Midtrans Payment Error Detail:', err?.ApiResponse || err?.message || err)
    const message = err?.ApiResponse?.error_messages?.[0] || err?.message || 'Gagal memproses pembayaran Midtrans'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
