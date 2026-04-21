import { createClient } from '@/lib/supabase/server'

export interface Team {
  id: string; name: string; country: string; owner_id: string | null; is_active: boolean; created_at: string
}
export interface Campaign {
  id: string; title: string; description: string | null; charity_id: string | null
  target_amount: number | null; raised_amount: number; start_date: string; end_date: string | null
  is_active: boolean; created_at: string; charities?: { name: string }
}

export async function getAllTeams(): Promise<Team[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('teams').select('*').order('name')
  if (error) throw error
  return data || []
}

export async function getAllCampaigns(includeInactive = false): Promise<Campaign[]> {
  const supabase = await createClient()
  let query = supabase.from('campaigns').select('*, charities(name)').order('start_date', { ascending: false })
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('campaigns').select('*, charities(name)').eq('id', id).single()
  if (error) return null
  return data
}
