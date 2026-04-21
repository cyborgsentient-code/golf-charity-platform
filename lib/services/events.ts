import { createClient } from '@/lib/supabase/server'

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  description: string | null
  event_date: string
  location: string | null
  created_at: string
}

export async function getCharityEvents(charityId: string): Promise<CharityEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('charity_events')
    .select('*')
    .eq('charity_id', charityId)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createCharityEvent(event: Omit<CharityEvent, 'id' | 'created_at'>): Promise<CharityEvent> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('charity_events').insert(event).select().single()
  if (error) throw error
  return data
}

export async function deleteCharityEvent(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('charity_events').delete().eq('id', id)
  if (error) throw error
}
