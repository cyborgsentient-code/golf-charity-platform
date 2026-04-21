import { getCharityById } from '@/lib/services/charities'
import { getCharityEvents } from '@/lib/services/events'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DonateButton from '@/components/DonateButton'
import Navbar from '@/components/Navbar'
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/Motion'

export default async function CharityDetailPage({ params }: { params: { id: string } }) {
  const charity = await getCharityById(params.id)
  if (!charity) notFound()
  const events = await getCharityEvents(params.id)

  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-hero pt-16">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {charity.image_url && (
            <FadeUp>
              <div className="relative h-64 rounded-2xl overflow-hidden mb-8 border border-white/10">
                <Image src={charity.image_url} alt={charity.name} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 to-transparent" />
              </div>
            </FadeUp>
          )}

          <FadeUp delay={0.1}>
            <div className="glass p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-tight mb-2">{charity.name}</h1>
                  <p className="text-white/60 text-lg">{charity.description}</p>
                </div>
                {charity.is_featured && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neon-green/15 text-neon-green border border-neon-green/30 shrink-0 ml-4">
                    Featured
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass p-4 text-center border border-neon-cyan/20">
                  <p className="text-2xl font-black text-neon-cyan">{charity.total_supporters}</p>
                  <p className="text-xs text-white/40 mt-1">Supporters</p>
                </div>
                <div className="glass p-4 text-center border border-white/10">
                  <p className="text-2xl font-black text-white">{charity.country}</p>
                  <p className="text-xs text-white/40 mt-1">Country</p>
                </div>
              </div>

              {charity.long_description && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3 text-white/80">About This Charity</h2>
                  <p className="text-white/50 leading-relaxed">{charity.long_description}</p>
                </div>
              )}

              {charity.website_url && (
                <div className="mb-8">
                  <a href={charity.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-neon-cyan hover:text-neon-cyan/80 transition text-sm font-medium">
                    Visit Website →
                  </a>
                </div>
              )}

              {events.length > 0 && (
                <div className="mb-8 pt-6 border-t border-white/8">
                  <h2 className="text-lg font-bold mb-4 text-white/80">Upcoming Events</h2>
                  <StaggerContainer className="space-y-3">
                    {events.map(event => (
                      <StaggerItem key={event.id} className="flex gap-4 glass p-4 border border-neon-green/15">
                        <div className="text-center min-w-[52px]">
                          <p className="text-xl font-black text-neon-green">
                            {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric' })}
                          </p>
                          <p className="text-xs text-white/40 uppercase tracking-wider">
                            {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          {event.location && <p className="text-sm text-white/40 mt-0.5">📍 {event.location}</p>}
                          {event.description && <p className="text-sm text-white/50 mt-1">{event.description}</p>}
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              <div className="pt-6 border-t border-white/8">
                <h3 className="text-lg font-bold mb-2">Support This Charity</h3>
                <p className="text-white/50 text-sm mb-5">Sign up and select this charity to contribute 10% of your subscription directly to their cause.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auth/signup" className="btn-neon px-6 py-3">Get Started</Link>
                  <DonateButton charityId={charity.id} charityName={charity.name} />
                </div>
              </div>
            </div>
          </FadeUp>
        </main>
      </div>
    </PageTransition>
  )
}
