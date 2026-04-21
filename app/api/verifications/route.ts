import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { submitWinnerProof } from '@/lib/services/verifications'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const { draw_result_id, proof_image_url } = await request.json()

    if (!draw_result_id || !proof_image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the draw result belongs to the user
    const { data: drawResult } = await supabase
      .from('draw_results')
      .select('user_id, prize_tier')
      .eq('id', draw_result_id)
      .single()

    if (!drawResult || drawResult.user_id !== user.id) {
      return NextResponse.json({ error: 'Invalid draw result' }, { status: 403 })
    }

    if (!drawResult.prize_tier) {
      return NextResponse.json({ error: 'No prize to claim' }, { status: 400 })
    }

    const verification = await submitWinnerProof(draw_result_id, user.id, proof_image_url)

    return NextResponse.json(verification)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
