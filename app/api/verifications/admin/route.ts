import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { verifyWinner, markAsPaid } from '@/lib/services/verifications'
import { sendWinnerAlertEmail, sendPaymentConfirmationEmail } from '@/lib/email'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { verification_id, action, approved, admin_notes } = await request.json()

    if (action === 'verify') {
      await verifyWinner(verification_id, user.id, approved, admin_notes)

      // Email winner on approval
      if (approved) {
        const { data: v } = await supabase
          .from('winner_verifications')
          .select('user_id, draw_results(prize_amount), profiles(email, full_name)')
          .eq('id', verification_id)
          .single()

        if ((v?.profiles as any)?.email) {
          sendWinnerAlertEmail((v as any).profiles.email, (v as any).profiles.full_name || 'Golfer', (v as any).draw_results?.prize_amount || 0).catch(() => {})
        }
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'mark_paid') {
      await markAsPaid(verification_id)

      const { data: v } = await supabase
        .from('winner_verifications')
        .select('draw_results(prize_amount), profiles(email, full_name)')
        .eq('id', verification_id)
        .single()

      if ((v?.profiles as any)?.email) {
        sendPaymentConfirmationEmail((v as any).profiles.email, (v as any).profiles.full_name || 'Golfer', (v as any).draw_results?.prize_amount || 0).catch(() => {})
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
