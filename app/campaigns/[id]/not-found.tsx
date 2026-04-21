import Link from 'next/link'

export default function CampaignNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl mb-3">⛳</p>
        <h1 className="text-xl font-bold mb-2">Campaign not found</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
          This campaign doesn't exist or is no longer active.
        </p>
        <Link href="/campaigns" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          View all campaigns
        </Link>
      </div>
    </div>
  )
}
