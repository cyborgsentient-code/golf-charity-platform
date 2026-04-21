import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createDraw, processDrawResults, publishDraw } from '@/lib/services/draws'
import { sendDrawResultEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { draw_type, status, auto_publish } = await request.json()
    const drawStatus = status || (auto_publish ? 'published' : 'draft')
    const draw = await createDraw(user.id, draw_type || 'random', drawStatus)
    await processDrawResults(draw.id, true)

    // Send draw result emails if published
    if (drawStatus === 'published') {
      await sendDrawResultEmails(supabase, draw.id, draw.draw_date)
    }

    return NextResponse.json(draw)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { draw_id, action } = await request.json()

    if (action === 'publish') {
      await publishDraw(draw_id)

      // Get draw date then send emails
      const { data: draw } = await supabase.from('draws').select('draw_date').eq('id', draw_id).single()
      if (draw) await sendDrawResultEmails(supabase, draw_id, draw.draw_date)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function sendDrawResultEmails(supabase: any, drawId: string, drawDate: string) {
  const { data: results } = await supabase
    .from('draw_results')
    .select('matched_count, prize_tier, prize_amount, profiles(email, full_name)')
    .eq('draw_id', drawId)

  if (!results) return

  // Fire emails without blocking the response
  for (const result of results) {
    const email = result.profiles?.email
    const name = result.profiles?.full_name || 'Golfer'
    if (!email) continue
    sendDrawResultEmail(email, name, result.matched_count, result.prize_tier, result.prize_amount || 0, drawDate).catch(() => {})
  }
}
