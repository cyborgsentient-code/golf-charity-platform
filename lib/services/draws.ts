import { createClient } from '@/lib/supabase/server'
import { Draw, DrawResult } from '@/lib/types'
import { calculatePrizePool, distributePrizes } from './prizePool'

/**
 * CRITICAL: Draw System Logic
 * Handles draw generation and matching algorithm
 */

// Generate 5 unique random numbers between 1-45
export function generateDrawNumbers(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

// Generate algorithmic numbers (weighted by user score frequency)
export async function generateAlgorithmicNumbers(): Promise<number[]> {
  const supabase = await createClient()
  
  // Get all scores from active users
  const { data: scores } = await supabase
    .from('scores')
    .select('value, profiles!inner(subscription_status)')
    .eq('profiles.subscription_status', 'active')
  
  if (!scores || scores.length === 0) {
    return generateDrawNumbers() // Fallback to random
  }
  
  // Count frequency of each number
  const frequency: { [key: number]: number } = {}
  scores.forEach((score: any) => {
    frequency[score.value] = (frequency[score.value] || 0) + 1
  })
  
  // Sort by frequency (most common first)
  const sortedNumbers = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .map(([num]) => parseInt(num))
  
  // Take top 5 most common numbers
  return sortedNumbers.slice(0, 5).sort((a, b) => a - b)
}

// Calculate matches between two number arrays
export function calculateMatches(userNumbers: number[], drawNumbers: number[]): {
  matchedCount: number
  matchedNumbers: number[]
  prizeTier: string | null
} {
  const matched = userNumbers.filter(num => drawNumbers.includes(num))
  const matchedCount = matched.length
  
  let prizeTier: string | null = null
  if (matchedCount === 3) prizeTier = '3-match'
  else if (matchedCount === 4) prizeTier = '4-match'
  else if (matchedCount === 5) prizeTier = '5-match'
  
  return {
    matchedCount,
    matchedNumbers: matched.sort((a, b) => a - b),
    prizeTier
  }
}

// Create a new draw (draft or simulation mode)
export async function createDraw(
  adminId: string, 
  drawType: 'random' | 'algorithmic' = 'random',
  status: 'draft' | 'simulated' | 'published' = 'draft'
): Promise<Draw> {
  const supabase = await createClient()
  
  const numbers = drawType === 'random' 
    ? generateDrawNumbers() 
    : await generateAlgorithmicNumbers()
  
  const drawDate = new Date().toISOString().split('T')[0]
  const monthYear = new Date().toISOString().slice(0, 7)
  
  // Calculate prize pool
  const prizePool = await calculatePrizePool(monthYear)
  
  const { data, error } = await supabase
    .from('draws')
    .insert({
      draw_date: drawDate,
      numbers,
      draw_type: drawType,
      status,
      total_pool_amount: prizePool.totalPool,
      jackpot_amount: prizePool.jackpotRollover,
      five_match_pool: prizePool.fiveMatchPool,
      four_match_pool: prizePool.fourMatchPool,
      three_match_pool: prizePool.threeMatchPool,
      created_by: adminId,
      published_at: status === 'published' ? new Date().toISOString() : null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Process draw results for all users
export async function processDrawResults(drawId: string, autoDistribute: boolean = true): Promise<void> {
  const supabase = await createClient()
  
  // Get the draw
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()
  
  if (drawError) throw drawError
  
  // Get all users with exactly 5 scores and active subscription
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')
  
  if (usersError) throw usersError
  
  const results: any[] = []
  
  for (const user of users || []) {
    // Get user's 5 most recent scores
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('value')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (scoresError) continue
    if (!scores || scores.length !== 5) continue
    
    const userNumbers = scores.map(s => s.value).sort((a, b) => a - b)
    const matchResult = calculateMatches(userNumbers, draw.numbers)
    
    results.push({
      draw_id: drawId,
      user_id: user.id,
      user_numbers: userNumbers,
      matched_count: matchResult.matchedCount,
      matched_numbers: matchResult.matchedNumbers,
      prize_tier: matchResult.prizeTier,
      prize_amount: 0, // Will be calculated in distributePrizes
      verification_status: matchResult.prizeTier ? 'pending' : 'not_applicable'
    })
  }
  
  // Bulk insert results
  if (results.length > 0) {
    const { error: insertError } = await supabase
      .from('draw_results')
      .insert(results)
    
    if (insertError) throw insertError
  }
  
  // Distribute prizes if auto-distribute is enabled
  if (autoDistribute) {
    await distributePrizes(drawId)
  }
}

// Publish a draft draw
export async function publishDraw(drawId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', drawId)
  
  if (error) throw error
}

// Get recent draws (published only for non-admins)
export async function getRecentDraws(limit: number = 10, includeUnpublished: boolean = false): Promise<Draw[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('draws')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (!includeUnpublished) {
    query = query.eq('status', 'published')
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

// Get user's draw results
export async function getUserDrawResults(userId: string, limit: number = 10): Promise<DrawResult[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('draw_results')
    .select(`
      *,
      draw:draws(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

// Get draw results for a specific draw
export async function getDrawResults(drawId: string): Promise<DrawResult[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('draw_results')
    .select('*')
    .eq('draw_id', drawId)
    .order('matched_count', { ascending: false })
  
  if (error) throw error
  return data || []
}
