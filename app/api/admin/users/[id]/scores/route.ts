import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
  return data?.is_admin === true
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', params.id)
      .order('score_date', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { score_id, value, score_date } = await request.json()
    if (value < 1 || value > 45) return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })

    const { data, error } = await supabase
      .from('scores')
      .update({ value, score_date })
      .eq('id', score_id)
      .eq('user_id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAdmin(supabase, user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { score_id } = await request.json()
    const { error } = await supabase.from('scores').delete().eq('id', score_id).eq('user_id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
