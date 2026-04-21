import { createClient } from '@/lib/supabase/server'
import { WinnerVerification } from '@/lib/types'

export async function submitWinnerProof(
  drawResultId: string,
  userId: string,
  proofImageUrl: string
): Promise<WinnerVerification> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('winner_verifications')
    .upsert({
      draw_result_id: drawResultId,
      user_id: userId,
      proof_image_url: proofImageUrl,
      status: 'pending',
      payment_status: 'pending'
    }, {
      onConflict: 'draw_result_id'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserVerifications(userId: string): Promise<WinnerVerification[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('winner_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('submission_date', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getAllPendingVerifications(): Promise<WinnerVerification[]> {  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      draw_results(
        *,
        draws(draw_date, numbers),
        profiles(email, full_name)
      )
    `)
    .eq('status', 'pending')
    .order('submission_date', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getAllVerifications(): Promise<WinnerVerification[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('winner_verifications')
    .select(`
      *,
      draw_results(
        *,
        draws(draw_date, numbers),
        profiles(email, full_name)
      )
    `)
    .order('submission_date', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function verifyWinner(
  verificationId: string,
  adminId: string,
  approved: boolean,
  adminNotes?: string
): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('winner_verifications')
    .update({
      status: approved ? 'approved' : 'rejected',
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      admin_notes: adminNotes || null
    })
    .eq('id', verificationId)
  
  if (error) throw error
}

export async function markAsPaid(verificationId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('winner_verifications')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', verificationId)
  
  if (error) throw error
}

export async function getWinnerStats() {
  const supabase = await createClient()
  
  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('status, payment_status')
  
  const stats = {
    total: verifications?.length || 0,
    pending: verifications?.filter(v => v.status === 'pending').length || 0,
    approved: verifications?.filter(v => v.status === 'approved').length || 0,
    rejected: verifications?.filter(v => v.status === 'rejected').length || 0,
    paid: verifications?.filter(v => v.payment_status === 'paid').length || 0,
    unpaid: verifications?.filter(v => v.payment_status === 'pending' && v.status === 'approved').length || 0,
  }
  
  return stats
}
