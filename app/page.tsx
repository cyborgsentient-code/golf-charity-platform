import Link from 'next/link'
import { getFeaturedCharities, getTotalCharityDonations } from '@/lib/services/charities'
import { getLatestJackpot } from '@/lib/services/prizePool'
import { FadeUp, StaggerContainer, StaggerItem, HoverGlow, TiltCard, AnimatedCounter, PageTransition } from '@/components/Motion'
import Navbar from '@/components/Navbar'
import HeroContent from '@/components/HeroContent'

export default async function Home() {
  const [featuredCharities, jackpot, totalDonated] = await Promise.all([
    getFeaturedCharities(),
    getLatestJackpot(),
    getTotalCharityDonations(),
  ])

  return (
    <PageTransition>
      <Navbar />

      <main className="min-h-screen bg-cyber-hero pt-16">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <HeroContent />

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="py-16 border-y border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StaggerItem>
                <TiltCard className="stat-card text-center border-neon-green/20">
                  <p className="text-sm text-white/50 uppercase tracking-widest">Current Jackpot</p>
                  <p className="text-4xl font-black text-neon-green glow-green tabular">
                    $<AnimatedCounter value={jackpot} decimals={0} />
                  </p>
                  <p className="text-xs text-white/30">Rolls over if unclaimed</p>
                </TiltCard>
              </StaggerItem>
              <StaggerItem>
                <TiltCard className="stat-card text-center border-neon-cyan/20">
                  <p className="text-sm text-white/50 uppercase tracking-widest">Donated / Month</p>
                  <p className="text-4xl font-black text-neon-cyan glow-cyan tabular">
                    $<AnimatedCounter value={totalDonated} decimals={0} suffix="/mo" />
                  </p>
                  <p className="text-xs text-white/30">Real charity impact</p>
                </TiltCard>
              </StaggerItem>
              <StaggerItem>
                <TiltCard className="stat-card text-center border-neon-magenta/20">
                  <p className="text-sm text-white/50 uppercase tracking-widest">Charities</p>
                  <p className="text-4xl font-black text-neon-magenta glow-magenta">
                    <AnimatedCounter value={featuredCharities.length} suffix="+" />
                  </p>
                  <p className="text-xs text-white/30">Vetted organisations</p>
                </TiltCard>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp className="text-center mb-16">
              <h2 className="font-display text-display-lg font-bold mb-4">How It Works</h2>
              <p className="text-white/50 text-lg">Simple. Transparent. Impactful.</p>
            </FadeUp>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: '01', color: 'neon-green', glow: 'glow-green', title: 'Choose Your Charity', body: 'Select from vetted charities. 10% of your subscription goes directly to them every month.' },
                { n: '02', color: 'neon-cyan',  glow: 'glow-cyan',  title: 'Track Your Scores',  body: 'Enter your 5 most recent Stableford scores (1–45). Update anytime — oldest auto-replaced.' },
                { n: '03', color: 'neon-magenta', glow: 'glow-magenta', title: 'Win Monthly Prizes', body: 'Monthly draws match your scores. 3+ matches win prizes. 5 matches = jackpot!' },
              ].map(s => (
                <StaggerItem key={s.n}>
                  <HoverGlow color={s.color === 'neon-green' ? 'green' : s.color === 'neon-cyan' ? 'cyan' : 'magenta'} className="glass p-8 h-full">
                    <div className={`text-5xl font-black text-${s.color} ${s.glow} mb-4`}>{s.n}</div>
                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                    <p className="text-white/50 leading-relaxed">{s.body}</p>
                  </HoverGlow>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── Prize Structure ───────────────────────────────────── */}
        <section className="py-24 border-y border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeUp className="text-center mb-16">
              <h2 className="font-display text-display-lg font-bold mb-4">Prize Structure</h2>
              <p className="text-white/50 text-lg">Fair distribution, exciting rewards</p>
            </FadeUp>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { emoji: '🥉', label: '3-Match', pct: '25%', color: 'border-amber-500/40', textColor: 'text-amber-400', rollover: false },
                { emoji: '🥈', label: '4-Match', pct: '35%', color: 'border-white/20',     textColor: 'text-white/70',  rollover: false },
                { emoji: '🏆', label: '5-Match', pct: '40%', color: 'border-neon-green/50', textColor: 'text-neon-green glow-green', rollover: true },
              ].map(t => (
                <StaggerItem key={t.label}>
                  <TiltCard className={`glass p-8 text-center border ${t.color}`}>
                    <div className="text-5xl mb-4">{t.emoji}</div>
                    <h3 className="text-2xl font-bold mb-2">{t.label}</h3>
                    <p className={`text-4xl font-black mb-3 ${t.textColor}`}>{t.pct}</p>
                    <p className="text-white/40 text-sm">of prize pool</p>
                    {t.rollover && <p className="mt-3 text-xs text-neon-green/70 border border-neon-green/20 rounded-full px-3 py-1 inline-block">Jackpot rolls over</p>}
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ── Featured Charities ────────────────────────────────── */}
        {featuredCharities.length > 0 && (
          <section className="py-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <FadeUp className="text-center mb-16">
                <h2 className="font-display text-display-lg font-bold mb-4">Featured Charities</h2>
                <p className="text-white/50 text-lg">Real impact, one subscription at a time</p>
              </FadeUp>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCharities.map(c => (
                  <StaggerItem key={c.id}>
                    <HoverGlow className="h-full">
                      <Link href={`/charities/${c.id}`} className="glass p-6 flex flex-col h-full hover:border-neon-green/30 transition-colors duration-300">
                        <h3 className="text-lg font-bold mb-2">{c.name}</h3>
                        <p className="text-white/50 text-sm flex-1 leading-relaxed">{c.description}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
                          <span className="text-xs text-white/30">{c.total_supporters} supporters</span>
                          <span className="text-neon-green text-sm font-medium">Learn more →</span>
                        </div>
                      </Link>
                    </HoverGlow>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <FadeUp className="text-center mt-10">
                <Link href="/charities" className="btn-ghost px-8 py-3">View All Charities</Link>
              </FadeUp>
            </div>
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-28 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-transparent to-neon-cyan/5" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <FadeUp>
              <h2 className="font-display text-display-lg font-bold tracking-tight mb-6">
                Ready to Make a <span className="text-gradient-green">Difference?</span>
              </h2>
              <p className="text-white/50 text-lg mb-10">Join golfers who are changing lives while playing the game they love.</p>
              <Link href="/auth/signup" className="btn-neon text-lg px-10 py-4 animate-pulse-glow">
                Get Started Today
              </Link>
            </FadeUp>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-white/8 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 font-bold text-lg mb-3">
                  <span className="text-neon-green">⛳</span>
                  <span>Golf <span className="text-neon-green">Charity</span></span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">Golf performance tracking combined with charitable giving and monthly prize draws.</p>
              </div>
              <div>
                <h4 className="text-white/70 font-semibold mb-4 text-sm uppercase tracking-widest">Platform</h4>
                <ul className="space-y-2 text-sm text-white/40">
                  {[['Charities', '/charities'], ['How It Works', '/how-it-works'], ['Sign Up', '/auth/signup'], ['Login', '/auth/login']].map(([l, h]) => (
                    <li key={h}><Link href={h} className="hover:text-neon-green transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white/70 font-semibold mb-4 text-sm uppercase tracking-widest">Contact</h4>
                <a href="mailto:support@golfcharity.com" className="text-sm text-white/40 hover:text-neon-green transition-colors">
                  support@golfcharity.com
                </a>
              </div>
            </div>
            <div className="border-t border-white/8 pt-8 text-center text-xs text-white/20">
              © 2026 Golf Charity Platform. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </PageTransition>
  )
}
