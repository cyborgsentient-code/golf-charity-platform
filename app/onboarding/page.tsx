'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Charity } from '@/lib/types'
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/Motion'

export default function OnboardingPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    createClient().from('charities').select('*').eq('is_active', true).order('name')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setCharities(data || [])
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('user_charity_selections').insert({ user_id: user.id, charity_id: selected, contribution_percentage: 10 })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-cyber-hero flex items-center justify-center">
      <div className="text-neon-green animate-pulse text-lg font-semibold">Loading charities…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cyber-hero flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-neon-green/6 blur-3xl" />
      </div>
      <div className="relative w-full max-w-2xl">
        <FadeUp className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold tracking-tight mb-3">Choose Your Charity</h1>
          <p className="text-white/50">10% of your subscription goes directly to your chosen charity every month</p>
        </FadeUp>

        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

          <StaggerContainer className="space-y-3 mb-8">
            {charities.map(c => (
              <StaggerItem key={c.id}>
                <label className={`block glass p-5 cursor-pointer transition-all duration-200 border ${
                  selected === c.id ? 'border-neon-green/60 bg-neon-green/5' : 'border-white/8 hover:border-white/20'
                }`}>
                  <input type="radio" name="charity" value={c.id} checked={selected === c.id}
                    onChange={e => setSelected(e.target.value)} className="sr-only" />
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      <p className="text-white/50 text-sm mt-1">{c.description}</p>
                    </div>
                    {selected === c.id && <span className="text-neon-green text-xl ml-4 shrink-0">✓</span>}
                  </div>
                </label>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <button type="submit" disabled={!selected || submitting}
            className="btn-neon w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? 'Saving…' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
