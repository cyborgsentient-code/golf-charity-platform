'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CharityPercentageAdjusterProps {
  userId: string
  currentCharityId: string
  currentPercentage: number
}

export default function CharityPercentageAdjuster({ 
  userId, 
  currentCharityId, 
  currentPercentage 
}: CharityPercentageAdjusterProps) {
  const [percentage, setPercentage] = useState(currentPercentage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/charity/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charity_id: currentCharityId,
          contribution_percentage: percentage
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Adjust Charity Contribution</h3>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-3 py-2 rounded text-sm mb-4">
          ✓ Contribution percentage updated!
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Contribution Percentage: {percentage}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>10% (minimum)</span>
            <span>100%</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {percentage}% of your subscription fee will go to your selected charity.
        </p>

        <button
          onClick={handleUpdate}
          disabled={loading || percentage === currentPercentage}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Updating...' : 'Update Contribution'}
        </button>
      </div>
    </div>
  )
}
