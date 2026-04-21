import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllProfiles } from '@/lib/services/profiles'
import { getRecentDraws } from '@/lib/services/draws'
import { getAllPendingVerifications, getAllVerifications } from '@/lib/services/verifications'
import AdminDrawTriggerEnhanced from '@/components/AdminDrawTriggerEnhanced'
import AdminUserListEnhanced from '@/components/AdminUserListEnhanced'
import AdminDrawList from '@/components/AdminDrawList'
import AdminWinnerVerification from '@/components/AdminWinnerVerification'
import AdminAnalytics from '@/components/AdminAnalytics'
import AdminCharityManager from '@/components/AdminCharityManager'
import AdminTeamManager from '@/components/AdminTeamManager'
import AdminCampaignManager from '@/components/AdminCampaignManager'
import { getAllCharities } from '@/lib/services/charities'
import { getAllTeams, getAllCampaigns } from '@/lib/services/teams'
import Navbar from '@/components/Navbar'
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from '@/components/Motion'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  const [profiles, draws, verifications, charities, teams, campaigns] = await Promise.all([
    getAllProfiles(),
    getRecentDraws(10, true),
    getAllVerifications(),
    getAllCharities(true),
    getAllTeams(),
    getAllCampaigns(false)
  ])

  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-hero pt-16">
        <Navbar isAdmin userEmail={user.email} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FadeUp className="mb-8">
            <h1 className="text-3xl font-display font-bold tracking-tight">Admin Panel</h1>
            <p className="text-white/40 text-sm mt-1">Platform management & controls</p>
          </FadeUp>
          <StaggerContainer className="space-y-6">
            {[
              { title: 'Analytics & Reports', content: <AdminAnalytics /> },
              { title: 'Trigger Draw', content: <AdminDrawTriggerEnhanced userId={user.id} /> },
              { title: `Winner Verifications (${verifications.length})`, content: <AdminWinnerVerification verifications={verifications} /> },
              { title: 'Charity Management', content: <AdminCharityManager initialCharities={charities} /> },
              { title: 'Recent Draws', content: <AdminDrawList draws={draws} /> },
              { title: 'Teams / Corporate Accounts', content: <AdminTeamManager initialTeams={teams} /> },
              { title: 'Campaigns', content: <AdminCampaignManager initialCampaigns={campaigns} charities={charities} /> },
              { title: `Users (${profiles.length})`, content: <AdminUserListEnhanced profiles={profiles} /> },
            ].map(section => (
              <StaggerItem key={section.title}>
                <div className="glass p-6 border border-white/8">
                  <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-5">{section.title}</h2>
                  {section.content}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </main>
      </div>
    </PageTransition>
  )
}
