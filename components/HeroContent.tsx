'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'


export default function HeroContent() {
  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center">

      {/* ── Background ── */}
      <div className="absolute inset-0" style={{ background: '#030712' }}>

        {/* Grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,135,0.18) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.18) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Green orb top-right */}
        <div className="hero-orb-green absolute rounded-full pointer-events-none"
          style={{ width: 640, height: 640, top: '-15%', right: '-8%', background: 'radial-gradient(circle, rgba(0,255,135,0.18) 0%, transparent 65%)' }}
        />
        {/* Cyan orb bottom-right */}
        <div className="hero-orb-magenta absolute rounded-full pointer-events-none"
          style={{ width: 440, height: 440, bottom: '-12%', right: '20%', background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 65%)' }}
        />

        {/* Left vignette — only covers left 45% so right side stays clear */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #030712 0%, rgba(3,7,18,0.7) 25%, transparent 45%)' }}
        />
      </div>

      {/* ── Floating particles — scores (green) + currencies (cyan/yellow) ── */}
      {([
        { n: '32',   x: '57%', delay: '0s',   dur: '8s',  size: '2.2rem', color: '#00ff87', shadow: '0 0 12px #00ff87, 0 0 30px rgba(0,255,135,0.8)' },
        { n: '18',   x: '70%', delay: '1.4s', dur: '10s', size: '1.7rem', color: '#00ff87', shadow: '0 0 12px #00ff87, 0 0 30px rgba(0,255,135,0.8)' },
        { n: '45',   x: '82%', delay: '2.8s', dur: '7s',  size: '2.6rem', color: '#00ff87', shadow: '0 0 12px #00ff87, 0 0 30px rgba(0,255,135,0.8)' },
        { n: '27',   x: '91%', delay: '0.5s', dur: '12s', size: '1.9rem', color: '#00ff87', shadow: '0 0 12px #00ff87, 0 0 30px rgba(0,255,135,0.8)' },
        { n: '9',    x: '76%', delay: '3.5s', dur: '9s',  size: '2.4rem', color: '#00ff87', shadow: '0 0 12px #00ff87, 0 0 30px rgba(0,255,135,0.8)' },
        { n: '41',   x: '64%', delay: '5s',   dur: '11s', size: '1.5rem', color: '#00ff87', shadow: '0 0 12px #00ff87, 0 0 30px rgba(0,255,135,0.8)' },
        { n: '$500', x: '60%', delay: '0.8s', dur: '9s',  size: '1.6rem', color: '#00e5ff', shadow: '0 0 12px #00e5ff, 0 0 30px rgba(0,229,255,0.8)' },
        { n: '₹250', x: '74%', delay: '2.2s', dur: '11s', size: '1.4rem', color: '#ffe600', shadow: '0 0 12px #ffe600, 0 0 30px rgba(255,230,0,0.8)'  },
        { n: '$1K',  x: '87%', delay: '4s',   dur: '8s',  size: '1.9rem', color: '#00e5ff', shadow: '0 0 12px #00e5ff, 0 0 30px rgba(0,229,255,0.8)' },
        { n: '₹5K',  x: '66%', delay: '1s',   dur: '13s', size: '1.5rem', color: '#ffe600', shadow: '0 0 12px #ffe600, 0 0 30px rgba(255,230,0,0.8)'  },
        { n: '$250', x: '94%', delay: '5.5s', dur: '10s', size: '1.3rem', color: '#00e5ff', shadow: '0 0 12px #00e5ff, 0 0 30px rgba(0,229,255,0.8)' },
        { n: '₹1K',  x: '80%', delay: '3s',   dur: '9s',  size: '1.7rem', color: '#ffe600', shadow: '0 0 12px #ffe600, 0 0 30px rgba(255,230,0,0.8)'  },
      ] as const).map(({ n, x, delay, dur, size, color, shadow }) => (
        <span
          key={`${n}-${x}`}
          className="hero-float absolute bottom-[-3rem] font-black select-none pointer-events-none"
          style={{ left: x, fontSize: size, color, textShadow: shadow, animationDuration: dur, animationDelay: delay, zIndex: 2 }}
        >
          {n}
        </span>
      ))}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            Golf · Charity · Prizes
          </span>
        </motion.div>

        {/* Headline — per-word blur-in */}
        <div className="mb-6">
          <motion.h1
            className="font-display text-display-xl font-bold leading-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {(['Play Golf.', 'Win Prizes.', 'Change Lives.'] as const).map((word, i) => (
              <motion.span
                key={word}
                className={`inline-block mr-[0.25em] ${i === 1 ? 'text-gradient-green' : ''}`}
                initial={{ opacity: 0, y: 32, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.15 }}
              >
                {word}
                {i < 2 && <br className="hidden sm:block" />}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-white/55 mb-10 max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
        >
          Every score you enter supports a charity. Every month, your scores could win you the jackpot.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
        >
          <Link href="/auth/signup" className="btn-neon text-base px-8 py-4 animate-pulse-glow text-center">
            Start Making Impact
          </Link>
          <Link href="/how-it-works" className="btn-ghost text-base px-8 py-4 text-center">
            How It Works →
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap items-center gap-6 mt-12 text-xs text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {['No hidden fees', 'Cancel anytime', '10% to charity'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="text-neon-green">✓</span> {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
