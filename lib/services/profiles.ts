import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function createProfile(userId: string, email: string, fullName?: string): Promise<Profile> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
