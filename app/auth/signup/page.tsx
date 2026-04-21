'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FadeUp } from '@/components/Motion'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName } },
      })
      if (authError) throw authError
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({ id: authData.user.id, email, full_name: fullName })
        if (profileError) throw profileError
        router.push('/onboarding')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-hero flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-neon-magenta/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-neon-green/6 blur-3xl" />
      </div>

      <FadeUp className="relative w-full max-w-md">
        <div className="glass p-8 border-neon">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
              <span className="text-neon-green">⛳</span>
              <span>Golf <span className="text-neon-green">Charity</span></span>
            </Link>
            <h1 className="text-3xl font-display font-bold tracking-tight">Create account</h1>
            <p className="text-white/50 mt-2 text-sm">Start making an impact today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className="input-cyber" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-cyber" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="input-cyber" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-neon w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-neon-green hover:text-neon-green/80 transition">Sign in</Link>
          </p>
        </div>
      </FadeUp>
    </div>
  )
}
