import { createClient } from '@/lib/supabase/server'
import { Score } from '@/lib/types'

/**
 * CRITICAL: Score Management Logic
 * Enforces 5-score rolling window per user
 */

export async function getUserScores(userId: string): Promise<Score[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addScore(userId: string, value: number, scoreDate: string): Promise<Score> {
  // Validate score value
  if (value < 1 || value > 45) {
    throw new Error('Score must be between 1 and 45')
  }

  const supabase = await createClient()
  
  // Insert new score (trigger will handle deletion of oldest if needed)
  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: userId,
      value,
      score_date: scoreDate
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteScore(scoreId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', userId)
  
  if (error) throw error
}

export async function getScoreCount(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (error) throw error
  return count || 0
}
