import { getAllCharities } from '@/lib/services/charities'
import CharityList from './CharityList'
import Navbar from '@/components/Navbar'
import { FadeUp, PageTransition } from '@/components/Motion'

export default async function CharitiesPage() {
  const charities = await getAllCharities()
  return (
    <PageTransition>
      <div className="min-h-screen bg-cyber-hero pt-16">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <FadeUp className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Support a Charity</h1>
            <p className="text-white/50 text-lg">10% of your subscription goes directly to your chosen charity</p>
          </FadeUp>
          <CharityList charities={charities} />
        </main>
      </div>
    </PageTransition>
  )
}
