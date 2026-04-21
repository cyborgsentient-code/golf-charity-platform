import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCharityEvents } from '@/lib/services/events'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const events = await getCharityEvents(params.id)
    return NextResponse.json(events)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
