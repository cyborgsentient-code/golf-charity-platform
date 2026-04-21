'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const links = [
  { href: '/charities', label: 'Charities' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/campaigns', label: 'Campaigns' },
]

export default function Navbar({ isAdmin = false, userEmail = '' }: { isAdmin?: boolean; userEmail?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isAuth = !!userEmail

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/8 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-neon-green glow-green">⛳</span>
          <span className="text-white">Golf</span>
          <span className="text-neon-green">Charity</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors duration-200 ${
                pathname.startsWith(l.href)
                  ? 'text-neon-green'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuth ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition">Admin</Link>
              )}
              <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button className="text-sm text-white/40 hover:text-red-400 transition">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
              <Link href="/auth/signup" className="btn-neon text-sm py-2 px-4">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden text-white/70 hover:text-white p-2">
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-white/8 bg-dark-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="block text-sm text-white/70 hover:text-neon-green transition py-1">{l.label}</Link>
              ))}
              {isAuth ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-sm text-white/70 hover:text-white py-1">Dashboard</Link>
                  <form action="/auth/signout" method="post">
                    <button className="text-sm text-red-400">Logout</button>
                  </form>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
                  <Link href="/auth/signup" className="btn-neon text-sm py-2 px-4">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
