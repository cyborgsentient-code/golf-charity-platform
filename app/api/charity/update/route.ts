import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { setUserCharity } from '@/lib/services/charities'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { charity_id, contribution_percentage } = await request.json()

    if (!charity_id || !contribution_percentage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const selection = await setUserCharity(user.id, charity_id, contribution_percentage)

    return NextResponse.json(selection)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
