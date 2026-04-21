'use client'

import { DrawResult } from '@/lib/types'
import WinnerProofUpload from './WinnerProofUpload'
import { motion } from 'framer-motion'

const tierConfig: Record<string, { label: string; color: string; glow: string; bg: string }> = {
  '5-match': { label: '🏆 Jackpot', color: 'text-neon-green', glow: 'glow-green', bg: 'bg-neon-green/10 border-neon-green/40' },
  '4-match': { label: '🥈 4-Match', color: 'text-neon-cyan',  glow: 'glow-cyan',  bg: 'bg-neon-cyan/10 border-neon-cyan/40' },
  '3-match': { label: '🥉 3-Match', color: 'text-amber-400',  glow: '',           bg: 'bg-amber-400/10 border-amber-400/40' },
}

export default function DrawResults({ results }: { results: DrawResult[] }) {
  if (results.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-4xl mb-3">🎯</p>
        <h2 className="text-lg font-bold mb-2">No Draw Results Yet</h2>
        <p className="text-white/40 text-sm">Results appear here after monthly draws are conducted.</p>
      </div>
    )
  }

  return (
    <div className="glass p-6">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-6">Recent Draw Results</h2>
      <div className="space-y-4">
        {results.map((result, i) => {
          const tier = result.prize_tier ? tierConfig[result.prize_tier] : null
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-xl p-4 border ${tier ? tier.bg : 'bg-white/3 border-white/8'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">{result.draw?.draw_date || result.created_at.split('T')[0]}</p>
                  {tier && (
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${tier.color} ${tier.glow}`}>{tier.label}</span>
                      {result.prize_amount > 0 && (
                        <span className={`text-lg font-black ${tier.color}`}>${result.prize_amount.toFixed(2)}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-white/40 font-medium">
                  {result.matched_count} match{result.matched_count !== 1 ? 'es' : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-xs text-white/40 mb-2">Your Numbers</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.user_numbers.map((num, idx) => (
                      <span key={idx} className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        result.matched_numbers.includes(num)
                          ? 'bg-neon-green text-dark-950 shadow-neon-green'
                          : 'bg-white/8 text-white/60'
                      }`}>{num}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-2">Draw Numbers</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.draw?.numbers.map((num, idx) => (
                      <span key={idx} className="w-9 h-9 flex items-center justify-center rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-bold border border-neon-cyan/30">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {result.prize_tier && <WinnerProofUpload drawResult={result} />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
