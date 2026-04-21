import { createClient } from '@/lib/supabase/server'

/**
 * Prize Pool Logic
 * - 40% for 5-match (jackpot, rolls over)
 * - 35% for 4-match
 * - 25% for 3-match
 */

const PRIZE_DISTRIBUTION = {
  FIVE_MATCH: 0.40,
  FOUR_MATCH: 0.35,
  THREE_MATCH: 0.25,
}

const SUBSCRIPTION_POOL_CONTRIBUTION = 0.50 // 50% of subscription goes to prize pool

export async function calculatePrizePool(monthYear: string) {
  const supabase = await createClient()
  
  // Get active subscribers count
  const { count: activeSubscribers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')
  
  if (!activeSubscribers) {
    return {
      totalPool: 0,
      fiveMatchPool: 0,
      fourMatchPool: 0,
      threeMatchPool: 0,
      jackpotRollover: 0,
    }
  }
  
  // Get subscription plans and calculate total revenue
  const { data: profiles } = await supabase
    .from('profiles')
    .select('subscription_plan_id, subscription_plans(price)')
    .eq('subscription_status', 'active')
  
  let totalRevenue = 0
  profiles?.forEach((profile: any) => {
    const price = profile.subscription_plans?.price || 10
    totalRevenue += price
  })
  
  // Calculate total pool (50% of revenue)
  const totalPool = totalRevenue * SUBSCRIPTION_POOL_CONTRIBUTION
  
  // Get previous jackpot rollover
  const { data: lastHistory } = await supabase
    .from('prize_pool_history')
    .select('jackpot_rollover')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  const jackpotRollover = lastHistory?.jackpot_rollover || 0
  
  // Calculate pool allocations
  const fiveMatchPool = (totalPool * PRIZE_DISTRIBUTION.FIVE_MATCH) + jackpotRollover
  const fourMatchPool = totalPool * PRIZE_DISTRIBUTION.FOUR_MATCH
  const threeMatchPool = totalPool * PRIZE_DISTRIBUTION.THREE_MATCH
  
  return {
    totalPool,
    fiveMatchPool,
    fourMatchPool,
    threeMatchPool,
    jackpotRollover,
    activeSubscribers,
  }
}

export async function distributePrizes(drawId: string) {
  const supabase = await createClient()
  
  // Get draw with pool amounts
  const { data: draw } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()
  
  if (!draw) throw new Error('Draw not found')
  
  // Get all results for this draw
  const { data: results } = await supabase
    .from('draw_results')
    .select('*')
    .eq('draw_id', drawId)
  
  if (!results) return
  
  // Count winners by tier
  const fiveMatchWinners = results.filter(r => r.prize_tier === '5-match').length
  const fourMatchWinners = results.filter(r => r.prize_tier === '4-match').length
  const threeMatchWinners = results.filter(r => r.prize_tier === '3-match').length
  
  // Calculate prize per winner
  const fiveMatchPrize = fiveMatchWinners > 0 ? draw.five_match_pool / fiveMatchWinners : 0
  const fourMatchPrize = fourMatchWinners > 0 ? draw.four_match_pool / fourMatchWinners : 0
  const threeMatchPrize = threeMatchWinners > 0 ? draw.three_match_pool / threeMatchWinners : 0
  
  // Update each result with prize amount
  for (const result of results) {
    let prizeAmount = 0
    
    if (result.prize_tier === '5-match') prizeAmount = fiveMatchPrize
    else if (result.prize_tier === '4-match') prizeAmount = fourMatchPrize
    else if (result.prize_tier === '3-match') prizeAmount = threeMatchPrize
    
    if (prizeAmount > 0) {
      await supabase
        .from('draw_results')
        .update({ prize_amount: prizeAmount })
        .eq('id', result.id)
    }
  }
  
  // Calculate jackpot rollover (if no 5-match winners)
  const newJackpotRollover = fiveMatchWinners === 0 ? draw.five_match_pool : 0
  
  // Save prize pool history
  const monthYear = new Date(draw.draw_date).toISOString().slice(0, 7)

  const { count: activeSubscribers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')

  await supabase
    .from('prize_pool_history')
    .insert({
      draw_id: drawId,
      month_year: monthYear,
      total_subscribers: activeSubscribers || 0,
      total_pool_amount: draw.total_pool_amount,
      jackpot_rollover: newJackpotRollover,
      five_match_allocated: draw.five_match_pool,
      four_match_allocated: draw.four_match_pool,
      three_match_allocated: draw.three_match_pool,
      five_match_winners: fiveMatchWinners,
      four_match_winners: fourMatchWinners,
      three_match_winners: threeMatchWinners,
    })
  
  return {
    fiveMatchWinners,
    fourMatchWinners,
    threeMatchWinners,
    fiveMatchPrize,
    fourMatchPrize,
    threeMatchPrize,
    jackpotRollover: newJackpotRollover,
  }
}

export async function getLatestJackpot(): Promise<number> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('prize_pool_history')
    .select('jackpot_rollover')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return data?.jackpot_rollover || 0
}
