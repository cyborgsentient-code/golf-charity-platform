import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserScores } from '@/lib/services/scores'
import { getUserCharitySelection, getMonthlyContributionAmount } from '@/lib/services/charities'
import { getUserDrawResults } from '@/lib/services/draws'
import { getProfile } from '@/lib/services/profiles'
import { getUserVerifications } from '@/lib/services/verifications'
import ScoreManagerEnhanced from '@/components/ScoreManagerEnhanced'
import DrawResults from '@/components/DrawResults'
import ParticipationSummary from '@/components/ParticipationSummary'
import WinningsOverview from '@/components/WinningsOverview'
import CharityPercentageAdjuster from '@/components/CharityPercentageAdjuster'
import ManageSubscription from '@/components/ManageSubscription'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/Motion'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profile, scores, charitySelection, drawResults, verifications, monthlyContribution] = await Promise.all([
    getProfile(user.id),
    getUserScores(user.id),
    getUserCharitySelection(user.id),
    getUserDrawResults(user.id, 10),
    getUserVerifications(user.id),
    getMonthlyContributionAmount(user.id),
  ])

  if (!charitySelection) redirect('/onboarding')

  const totalWinnings = drawResults.reduce((sum, r) => sum + (r.prize_amount || 0), 0)
  const now = new Date()
  const nextDrawDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-hero pt-16">
        <Navbar isAdmin={profile?.is_admin} userEmail={user.email} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Status row */}
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StaggerItem>
              <div className="glass p-6 h-full">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Account Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Subscription</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        profile?.subscription_status === 'active'
                          ? 'bg-neon-green/15 text-neon-green border border-neon-green/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {profile?.subscription_status}
                      </span>
                    </div>
                    {profile?.subscription_status === 'active'
                      ? <ManageSubscription />
                      : <Link href="/subscribe" className="text-xs text-neon-green hover:text-neon-green/80 transition">Subscribe →</Link>
                    }
                  </div>
                  {profile?.subscription_end_date && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Renewal</p>
                      <p className="text-sm font-medium">{new Date(profile.subscription_end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/40 mb-1">Charity</p>
                    <p className="text-sm font-semibold text-neon-cyan">{charitySelection.charity?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Contribution</p>
                    <p className="text-sm font-semibold">
                      {charitySelection.contribution_percentage}%
                      {monthlyContribution > 0 && <span className="text-neon-green ml-2">(${monthlyContribution}/mo)</span>}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem className="lg:col-span-2">
              <ParticipationSummary results={drawResults} nextDrawDate={nextDrawDate} />
            </StaggerItem>
          </StaggerContainer>

          {/* Main row */}
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <StaggerItem className="lg:col-span-2">
              <ScoreManagerEnhanced userId={user.id} initialScores={scores} />
            </StaggerItem>
            <StaggerItem className="space-y-6">
              <CharityPercentageAdjuster
                userId={user.id}
                currentCharityId={charitySelection.charity_id}
                currentPercentage={charitySelection.contribution_percentage}
              />
              <WinningsOverview verifications={verifications} totalWinnings={totalWinnings} />
            </StaggerItem>
          </StaggerContainer>

          {/* Draw results */}
          <FadeUp>
            <DrawResults results={drawResults} />
          </FadeUp>
        </main>
      </div>
    </PageTransition>
  )
}
