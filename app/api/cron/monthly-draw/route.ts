import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createDraw, processDrawResults } from '@/lib/services/draws'
import { sendDrawResultEmail } from '@/lib/email'

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Check if a draw already ran this month
    const monthYear = new Date().toISOString().slice(0, 7)
    const { data: existing } = await supabase
      .from('draws')
      .select('id')
      .eq('status', 'published')
      .gte('draw_date', `${monthYear}-01`)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: 'Draw already ran this month' })
    }

    // Get admin user to attribute the draw to
    const { data: admin } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'No admin user found' }, { status: 500 })
    }

    // Create and publish draw
    const draw = await createDraw(admin.id, 'random', 'published')
    await processDrawResults(draw.id, true)

    // Send emails to all participants
    const { data: results } = await supabase
      .from('draw_results')
      .select('matched_count, prize_tier, prize_amount, profiles(email, full_name)')
      .eq('draw_id', draw.id)

    for (const result of results || []) {
      const email = (result.profiles as any)?.email
      const name = (result.profiles as any)?.full_name || 'Golfer'
      if (email) {
        sendDrawResultEmail(email, name, result.matched_count, result.prize_tier, result.prize_amount || 0, draw.draw_date).catch(() => {})
      }
    }

    return NextResponse.json({ success: true, drawId: draw.id, numbers: draw.numbers })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
