import { createClient } from '@/lib/supabase/server'
import { Charity, UserCharitySelection } from '@/lib/types'

export async function getTotalCharityDonations(): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_charity_selections')
    .select('contribution_percentage, profiles(subscription_plan_id, subscription_plans(price))')
    .eq('profiles.subscription_status', 'active')
  if (!data) return 0
  return data.reduce((sum: number, sel: any) => {
    const price = sel.profiles?.subscription_plans?.price || 0
    return sum + (price * sel.contribution_percentage) / 100
  }, 0)
}

export async function getMonthlyContributionAmount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('subscription_plan_id, subscription_plans(price), user_charity_selections(contribution_percentage)')
    .eq('id', userId)
    .single()

  if (!data?.subscription_plans || !data?.user_charity_selections?.[0]) return 0

  const price = (data.subscription_plans as any).price || 0
  const pct = (data.user_charity_selections as any)[0].contribution_percentage || 10
  return parseFloat(((price * pct) / 100).toFixed(2))
}

export async function getAllCharities(includeInactive: boolean = false): Promise<Charity[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('charities')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('name')
  
  if (!includeInactive) {
    query = query.eq('is_active', true)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getFeaturedCharities(): Promise<Charity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getCharityById(id: string): Promise<Charity | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function searchCharities(query: string): Promise<Charity[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getUserCharitySelection(userId: string): Promise<UserCharitySelection | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_charity_selections')
    .select(`
      *,
      charity:charities(*)
    `)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function setUserCharity(
  userId: string, 
  charityId: string, 
  contributionPercentage: number = 10
): Promise<UserCharitySelection> {
  const supabase = await createClient()
  
  if (contributionPercentage < 10 || contributionPercentage > 100) {
    throw new Error('Contribution percentage must be between 10 and 100')
  }
  
  // Upsert charity selection
  const { data, error } = await supabase
    .from('user_charity_selections')
    .upsert({
      user_id: userId,
      charity_id: charityId,
      contribution_percentage: contributionPercentage
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Update charity supporter count
  await updateCharitySupporterCount(charityId)
  
  return data
}

async function updateCharitySupporterCount(charityId: string) {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('user_charity_selections')
    .select('*', { count: 'exact', head: true })
    .eq('charity_id', charityId)
  
  await supabase
    .from('charities')
    .update({ total_supporters: count || 0 })
    .eq('id', charityId)
}
