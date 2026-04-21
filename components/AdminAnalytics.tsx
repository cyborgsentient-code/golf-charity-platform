'use client'

import { useState, useEffect } from 'react'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8 text-red-600">Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analytics.totalUsers}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscribers</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analytics.activeSubscribers}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Draws</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analytics.totalDraws}
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Prize Pool</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ${analytics.totalPrizePool.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
        <h3 className="font-semibold mb-3">Financial Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Prize Pool</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              ${analytics.totalPrizePool.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid Out</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ${analytics.totalPaidOut.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Charity Statistics */}
      {analytics.charityStats && analytics.charityStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
          <h3 className="font-semibold mb-3">Charity Contributions</h3>
          <div className="space-y-2">
            {analytics.charityStats.map((charity: any) => (
              <div key={charity.name} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">{charity.name}</span>
                <div className="text-right">
                  <span className="text-sm font-medium">{charity.supporters} supporters</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(avg {charity.avgContribution}%)</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 ml-2">${charity.totalAmount}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Draw Statistics */}
      {analytics.drawStats && analytics.drawStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
          <h3 className="font-semibold mb-3">Draw Statistics (Last 12)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                  <th className="pb-2 pr-4">Month</th>
                  <th className="pb-2 pr-4">Subscribers</th>
                  <th className="pb-2 pr-4">Pool</th>
                  <th className="pb-2 pr-4">5-Match</th>
                  <th className="pb-2 pr-4">4-Match</th>
                  <th className="pb-2 pr-4">3-Match</th>
                  <th className="pb-2">Jackpot Rollover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {analytics.drawStats.map((d: any) => (
                  <tr key={d.month_year}>
                    <td className="py-2 pr-4 font-medium">{d.month_year}</td>
                    <td className="py-2 pr-4">{d.total_subscribers}</td>
                    <td className="py-2 pr-4">${d.total_pool_amount?.toFixed(2)}</td>
                    <td className="py-2 pr-4">
                      <span className={d.five_match_winners > 0 ? 'text-yellow-600 font-semibold' : 'text-gray-400'}>
                        {d.five_match_winners} winner{d.five_match_winners !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{d.four_match_winners} winners</td>
                    <td className="py-2 pr-4">{d.three_match_winners} winners</td>
                    <td className="py-2">
                      {d.jackpot_rollover > 0
                        ? <span className="text-amber-600 font-semibold">${d.jackpot_rollover?.toFixed(2)}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
