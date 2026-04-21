import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { addScore } from '@/lib/services/scores'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const { value, score_date } = await request.json()

    // Validate input
    if (!value || !score_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (value < 1 || value > 45) {
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })
    }

    const score = await addScore(user.id, value, score_date)

    return NextResponse.json(score)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
