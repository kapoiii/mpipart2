import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/lib/auth'

// GET /api/equipment
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('equipment')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/equipment — admin only
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || (session.user as { role: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, rental_price, stock } = body

  const { data, error } = await supabaseAdmin
    .from('equipment')
    .insert({ name, rental_price, stock })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
