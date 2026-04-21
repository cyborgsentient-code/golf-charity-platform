'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FadeUp, StaggerContainer, StaggerItem, TiltCard } from '@/components/Motion'
import Navbar from '@/components/Navbar'
import { SkeletonCard } from '@/components/Skeleton'

interface Plan { id: string; name: string; price: number; interval: string; is_active: boolean }

export default function SubscribePage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
      if (profile?.subscription_status === 'active') { router.push('/dashboard'); return }
      const { data: plansData } = await supabase.from('subscription_plans').select('*').eq('is_active', true).order('price')
      setPlans(plansData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSubscribe(planId: string) {
    setSubscribing(planId)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setError(data.error || 'Unknown error'); setSubscribing(null) }
    } catch {
      setError('Error creating checkout session')
      setSubscribing(null)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-hero pt-16">
      <Navbar />

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-green/6 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-cyan/5 blur-3xl" />
      </div>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeUp className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-white/50 text-lg">Start making an impact today</p>
        </FadeUp>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonCard className="h-80" />
            <SkeletonCard className="h-80" />
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map(plan => {
              const isYearly = plan.interval === 'year'
              const savings = isYearly ? ((10 * 12 - plan.price) / (10 * 12) * 100).toFixed(0) : 0

              return (
                <StaggerItem key={plan.id}>
                  <TiltCard className={`glass p-8 relative h-full flex flex-col ${isYearly ? 'border-neon-green/50 shadow-neon-green' : 'border-white/10'}`}>
                    {isYearly && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-neon-green text-dark-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                          Save {savings}%
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className={`text-2xl font-black capitalize mb-3 ${isYearly ? 'text-neon-green glow-green' : 'text-white'}`}>
                        {plan.name}
                      </h3>
                      <div>
                        <span className="text-5xl font-black">${plan.price}</span>
                        <span className="text-white/40 ml-1">/{plan.interval}</span>
                      </div>
                      {isYearly && (
                        <p className="text-white/40 text-sm mt-1">${(plan.price / 12).toFixed(2)}/month</p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {['Track 5 golf scores', 'Monthly prize draws', '10% to charity', 'Win up to jackpot'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                          <span className="text-neon-green text-base">✓</span> {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 ${
                        isYearly
                          ? 'btn-neon animate-pulse-glow'
                          : 'btn-ghost'
                      }`}
                    >
                      {subscribing === plan.id ? 'Loading…' : `Subscribe ${plan.name}`}
                    </button>
                  </TiltCard>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}

        <FadeUp delay={0.3} className="text-center mt-8 text-sm text-white/30">
          Cancel anytime. No hidden fees. Powered by Stripe.
        </FadeUp>
      </main>
    </div>
  )
}
