import { getCampaign } from '@/lib/services/teams'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id)
  if (!campaign || !campaign.is_active) notFound()

  const progress = campaign.target_amount && campaign.raised_amount
    ? Math.min(100, Math.round((campaign.raised_amount / campaign.target_amount) * 100))
    : null

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/campaigns" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">← All Campaigns</Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold leading-tight">{campaign.title}</h1>
          <span className="ml-3 shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Active</span>
        </div>

        {campaign.charities?.name && (
          <p className="text-blue-600 dark:text-blue-400 font-medium">{campaign.charities.name}</p>
        )}

        {campaign.description && (
          <p className="text-gray-600 dark:text-gray-300">{campaign.description}</p>
        )}

        {progress !== null && (
          <div className="pt-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span className="font-medium text-gray-800 dark:text-gray-200">${campaign.raised_amount.toLocaleString()} raised</span>
              <span>Goal: ${campaign.target_amount!.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">{progress}% complete</p>
          </div>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
          <span>Start: {campaign.start_date}</span>
          {campaign.end_date && <span className="ml-4">End: {campaign.end_date}</span>}
        </div>
      </div>
    </main>
  )
}
