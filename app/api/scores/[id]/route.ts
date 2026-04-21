import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { deleteScore } from '@/lib/services/scores'

async function requireActiveSubscriber(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .single()
  return profile?.subscription_status === 'active'
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await requireActiveSubscriber(supabase, user.id))
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })

    await deleteScore(params.id, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await requireActiveSubscriber(supabase, user.id))
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })

    const { value, score_date } = await request.json()

    if (!value || !score_date)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    if (value < 1 || value > 45)
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })

    const { data, error } = await supabase
      .from('scores')
      .update({ value, score_date })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
