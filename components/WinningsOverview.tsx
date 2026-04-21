'use client'

import { AnimatedCounter } from '@/components/Motion'

interface Props { verifications: any[]; totalWinnings: number }

export default function WinningsOverview({ verifications, totalWinnings }: Props) {
  const paidAmount = verifications.filter(v => v.payment_status === 'paid').reduce((s, v) => s + (v.draw_results?.prize_amount || 0), 0)
  const pendingAmount = verifications.filter(v => v.status === 'approved' && v.payment_status === 'pending').reduce((s, v) => s + (v.draw_results?.prize_amount || 0), 0)
  const paid = verifications.filter(v => v.payment_status === 'paid').length
  const pending = verifications.filter(v => v.status === 'pending').length
  const approved = verifications.filter(v => v.status === 'approved' && v.payment_status === 'pending').length
  const rejected = verifications.filter(v => v.status === 'rejected').length

  return (
    <div className="glass p-6">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Winnings</h2>

      <div className="glass p-4 text-center border border-neon-green/20 mb-4">
        <p className="text-xs text-white/40 mb-1">Total Winnings</p>
        <p className="text-3xl font-black text-neon-green glow-green tabular">
          $<AnimatedCounter value={totalWinnings} decimals={2} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass p-3 border border-neon-green/15">
          <p className="text-xs text-white/40">Paid Out</p>
          <p className="text-lg font-bold text-neon-green">${paidAmount.toFixed(2)}</p>
          <p className="text-xs text-white/30">{paid} payment{paid !== 1 ? 's' : ''}</p>
        </div>
        <div className="glass p-3 border border-amber-400/15">
          <p className="text-xs text-white/40">Pending</p>
          <p className="text-lg font-bold text-amber-400">${pendingAmount.toFixed(2)}</p>
          <p className="text-xs text-white/30">{approved} approved</p>
        </div>
      </div>

      {verifications.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/8 text-xs">
          {pending > 0 && <div className="flex justify-between"><span className="text-white/40">Pending Review</span><span className="text-amber-400 font-semibold">{pending}</span></div>}
          {approved > 0 && <div className="flex justify-between"><span className="text-white/40">Awaiting Payment</span><span className="text-neon-cyan font-semibold">{approved}</span></div>}
          {paid > 0 && <div className="flex justify-between"><span className="text-white/40">Paid</span><span className="text-neon-green font-semibold">{paid}</span></div>}
          {rejected > 0 && <div className="flex justify-between"><span className="text-white/40">Rejected</span><span className="text-red-400 font-semibold">{rejected}</span></div>}
        </div>
      )}

      {verifications.length === 0 && (
        <p className="text-xs text-white/30 text-center py-2">No winnings yet. Keep playing!</p>
      )}
    </div>
  )
}
