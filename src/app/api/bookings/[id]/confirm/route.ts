import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { snap } from '@/lib/midtrans'

// POST /api/bookings/[id]/confirm — verify payment status with Midtrans API
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Fetch booking to verify ownership
    const { data: booking, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('id, code, user_id, status')
      .eq('id', id)
      .single()

    if (fetchErr || !booking) return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })

    const isAdmin = (session.user as { role: string }).role === 'ADMIN'
    if (!isAdmin && booking.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check transaction status directly from Midtrans Sandbox API
    let transactionStatus = ''
    let fraudStatus = ''

    try {
      // Check status using booking code
      const statusResponse = await snap.transaction.status(booking.code)
      transactionStatus = statusResponse?.transaction_status || ''
      fraudStatus = statusResponse?.fraud_status || ''
    } catch (midtransErr: any) {
      console.log('Midtrans status check notice:', midtransErr?.message || midtransErr)
    }

    let newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = booking.status

    if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
      newStatus = 'CONFIRMED'
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      newStatus = 'CANCELLED'
    } else if (isAdmin) {
      // Admin can manually force confirm if needed
      newStatus = 'CONFIRMED'
    }

    if (newStatus !== booking.status) {
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    if (newStatus === 'PENDING') {
      return NextResponse.json({ error: 'Pembayaran belum terverifikasi oleh Midtrans', status: 'PENDING' }, { status: 400 })
    }

    return NextResponse.json(booking)
  } catch (err: any) {
    console.error('Confirm payment error:', err)
    return NextResponse.json({ error: err.message || 'Verification error' }, { status: 500 })
  }
}
