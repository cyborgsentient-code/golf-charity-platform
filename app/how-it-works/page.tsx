import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/Motion'

export default function HowItWorksPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-hero pt-16">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <FadeUp className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">How the Draw Works</h1>
            <p className="text-white/50 text-xl">Fair, transparent, monthly — powered by your golf scores.</p>
          </FadeUp>

          <StaggerContainer className="space-y-4 mb-16">
            {[
              { n: '01', color: 'text-neon-green', border: 'border-neon-green/20', title: 'Enter Your 5 Golf Scores', body: 'Each month, enter your 5 most recent Stableford scores (1–45). Only your latest 5 are kept — adding a new score automatically replaces the oldest.' },
              { n: '02', color: 'text-neon-cyan',  border: 'border-neon-cyan/20',  title: 'Monthly Draw Numbers Generated', body: 'On the 1st of each month, 5 unique numbers between 1–45 are drawn — either fully random (lottery-style) or algorithmic (weighted by most frequent scores).' },
              { n: '03', color: 'text-neon-magenta', border: 'border-neon-magenta/20', title: 'Your Scores Are Matched', body: 'Your 5 scores are compared against the 5 drawn numbers. Every matching number counts toward your prize tier.' },
              { n: '04', color: 'text-amber-400', border: 'border-amber-400/20', title: 'Prizes Are Distributed', body: 'Prize money is split from the monthly pool. Multiple winners in the same tier share equally. The jackpot rolls over if unclaimed.' },
              { n: '05', color: 'text-white/70', border: 'border-white/10', title: 'Winners Verify & Get Paid', body: 'Winners upload a screenshot of their scores as proof. Admin reviews and approves, then processes payment.' },
            ].map(s => (
              <StaggerItem key={s.n}>
                <div className={`glass p-6 flex gap-6 border ${s.border}`}>
                  <div className={`text-4xl font-black ${s.color} w-12 shrink-0`}>{s.n}</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-white/50 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeUp>
            <div className="glass p-8 mb-10 border border-white/10">
              <h2 className="text-2xl font-display font-bold tracking-tight mb-6 text-center">Prize Pool Distribution</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                      <th className="text-left py-3 pr-6">Match</th>
                      <th className="text-left py-3 pr-6">Pool Share</th>
                      <th className="text-left py-3">Rollover?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    <tr><td className="py-3 pr-6">🏆 5-Number Match</td><td className="py-3 pr-6 font-black text-neon-green glow-green">40%</td><td className="py-3 text-neon-green text-xs">✓ Yes — rolls over</td></tr>
                    <tr><td className="py-3 pr-6">🥈 4-Number Match</td><td className="py-3 pr-6 font-black text-white/70">35%</td><td className="py-3 text-white/30 text-xs">No</td></tr>
                    <tr><td className="py-3 pr-6">🥉 3-Number Match</td><td className="py-3 pr-6 font-black text-amber-400">25%</td><td className="py-3 text-white/30 text-xs">No</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="glass p-8 mb-16 border border-white/10">
              <h2 className="text-2xl font-display font-bold tracking-tight mb-6 text-center">Draw Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-5 border border-neon-green/20">
                  <h3 className="font-bold text-neon-green mb-2">🎲 Random Draw</h3>
                  <p className="text-sm text-white/50">5 numbers picked at random from 1–45. Standard lottery-style — every number has equal chance.</p>
                </div>
                <div className="glass p-5 border border-neon-cyan/20">
                  <h3 className="font-bold text-neon-cyan mb-2">🧠 Algorithmic Draw</h3>
                  <p className="text-sm text-white/50">Numbers weighted by most frequently submitted scores across all active players — rewarding consistent golfers.</p>
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp className="text-center">
            <h2 className="text-3xl font-display font-bold tracking-tight mb-4">Ready to Play?</h2>
            <p className="text-white/50 mb-8">Subscribe, enter your scores, and you're automatically entered into the next monthly draw.</p>
            <Link href="/auth/signup" className="btn-neon text-lg px-10 py-4 animate-pulse-glow">Get Started</Link>
          </FadeUp>
        </main>
      </div>
    </PageTransition>
  )
}
