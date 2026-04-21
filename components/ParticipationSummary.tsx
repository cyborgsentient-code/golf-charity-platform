'use client'

import { DrawResult } from '@/lib/types'
import { AnimatedCounter } from '@/components/Motion'

interface Props { results: DrawResult[]; nextDrawDate: string }

export default function ParticipationSummary({ results, nextDrawDate }: Props) {
  const totalDraws = results.length
  const wins = results.filter(r => r.prize_tier).length
  const totalWinnings = results.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
  const bestMatch = Math.max(...results.map(r => r.matched_count), 0)

  const stats = [
    { label: 'Draws Entered', value: totalDraws, color: 'text-neon-cyan', border: 'border-neon-cyan/20' },
    { label: 'Wins',          value: wins,        color: 'text-neon-green', border: 'border-neon-green/20' },
    { label: 'Best Match',    value: bestMatch,   color: 'text-neon-magenta', border: 'border-neon-magenta/20' },
    { label: 'Total Won',     value: totalWinnings, prefix: '$', decimals: 2, color: 'text-amber-400', border: 'border-amber-400/20' },
  ]

  return (
    <div className="glass p-6 h-full">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Participation Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map(s => (
          <div key={s.label} className={`glass p-4 text-center border ${s.border}`}>
            <p className={`text-2xl font-black ${s.color}`}>
              <AnimatedCounter value={s.value} prefix={s.prefix} decimals={s.decimals ?? 0} />
            </p>
            <p className="text-xs text-white/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {totalDraws === 0 && (
        <p className="text-xs text-white/30 text-center py-2">Add 5 scores to enter the next draw!</p>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-white/8">
        <p className="text-xs text-white/40">Next Draw</p>
        <p className="text-sm font-semibold text-neon-green">{nextDrawDate}</p>
      </div>
    </div>
  )
}
