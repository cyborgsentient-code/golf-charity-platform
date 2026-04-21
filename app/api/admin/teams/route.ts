import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { data, error } = await supabase.from('teams').select('*, profiles(id, full_name, email)').order('name')
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await request.json()
    const { data, error } = await supabase.from('teams').insert({ ...body, owner_id: user.id }).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id, user_id } = await request.json()
    // Assign user to team
    const { error } = await supabase.from('profiles').update({ team_id: id }).eq('id', user_id)
    if (error) throw error
    return NextResponse.json({ success: true })
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
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
