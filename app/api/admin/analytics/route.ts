import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get analytics data
    const [
      { count: totalUsers },
      { count: activeSubscribers },
      { data: draws },
      { data: verifications },
      { data: charitySelections },
      { data: drawStats }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabase.from('draws').select('total_pool_amount, five_match_pool, four_match_pool, three_match_pool').eq('status', 'published'),
      supabase.from('winner_verifications').select('payment_status, draw_results(prize_amount)'),
      supabase.from('user_charity_selections').select('charity_id, contribution_percentage, charities(name), profiles(subscription_plan_id, subscription_plans(price))'),
      supabase.from('prize_pool_history')
        .select('month_year, total_subscribers, total_pool_amount, jackpot_rollover, five_match_winners, four_match_winners, three_match_winners, five_match_allocated, four_match_allocated, three_match_allocated')
        .order('month_year', { ascending: false })
        .limit(12)
    ])

    const totalPrizePool = draws?.reduce((sum, d) => sum + (d.total_pool_amount || 0), 0) || 0
    const totalPaidOut = verifications?.filter(v => v.payment_status === 'paid').reduce((sum, v) => sum + ((v.draw_results as any)?.prize_amount || 0), 0) || 0
    
    // Charity contributions — actual $ amounts
    const charityStats = await Promise.all(
      Object.entries(
        (charitySelections || []).reduce((acc: any, sel: any) => {
          const name = sel.charities?.name || 'Unknown'
          if (!acc[name]) acc[name] = { count: 0, totalPct: 0, totalAmount: 0 }
          acc[name].count++
          acc[name].totalPct += sel.contribution_percentage
          const price = sel.profiles?.subscription_plans?.price || 0
          acc[name].totalAmount += (price * sel.contribution_percentage) / 100
          return acc
        }, {})
      ).map(([name, stats]: [string, any]) => ({
        name,
        supporters: stats.count,
        avgContribution: (stats.totalPct / stats.count).toFixed(1),
        totalAmount: stats.totalAmount.toFixed(2),
      }))
    )

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      totalDraws: draws?.length || 0,
      totalPrizePool,
      totalPaidOut,
      charityStats,
      drawStats: drawStats || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
