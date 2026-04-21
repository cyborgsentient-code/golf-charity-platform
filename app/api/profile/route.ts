import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, country } = await request.json()
    if (!full_name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: full_name.trim(), ...(country && { country }) })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
