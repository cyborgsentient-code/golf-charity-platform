import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCharityEvent, deleteCharityEvent } from '@/lib/services/events'

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const event = await createCharityEvent(body)
    return NextResponse.json(event)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await request.json()
    await deleteCharityEvent(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
