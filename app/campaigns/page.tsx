import { getAllCampaigns } from '@/lib/services/teams'
import Link from 'next/link'

export const revalidate = 60

export default async function CampaignsPage() {
  const campaigns = await getAllCampaigns()

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Active fundraising campaigns supporting our charity partners.</p>

      {campaigns.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No active campaigns right now. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {campaigns.map(c => {
            const progress = c.target_amount && c.raised_amount
              ? Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100))
              : null
            return (
              <Link key={c.id} href={`/campaigns/${c.id}`}
                className="block border dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-lg leading-tight">{c.title}</h2>
                  <span className="ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Active</span>
                </div>
                {c.charities?.name && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">{c.charities.name}</p>
                )}
                {c.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{c.description}</p>
                )}
                {progress !== null && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>${c.raised_amount.toLocaleString()} raised</span>
                      <span>{progress}% of ${c.target_amount!.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {c.start_date}{c.end_date ? ` → ${c.end_date}` : ''}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
