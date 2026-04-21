'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminDrawTriggerEnhancedProps {
  userId: string
}

export default function AdminDrawTriggerEnhanced({ userId }: AdminDrawTriggerEnhancedProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [mode, setMode] = useState<'draft' | 'simulated' | 'published'>('published')
  const router = useRouter()

  const handleTriggerDraw = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draw_type: drawType,
          status: mode,
          auto_publish: mode === 'published'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      const draw = await response.json()
      setSuccess(`Draw created successfully! Numbers: ${draw.numbers.join(', ')} | Pool: $${draw.total_pool_amount.toFixed(2)}`)
      
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Draw Type</label>
          <select
            value={drawType}
            onChange={(e) => setDrawType(e.target.value as 'random' | 'algorithmic')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="random">Random</option>
            <option value="algorithmic">Algorithmic (Weighted)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {drawType === 'random' ? 'Standard lottery-style' : 'Based on most frequent user scores'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'draft' | 'simulated' | 'published')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="draft">Draft</option>
            <option value="simulated">Simulation</option>
            <option value="published">Publish Immediately</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'draft' ? 'Save without processing' : mode === 'simulated' ? 'Test run (not visible to users)' : 'Live draw'}
          </p>
        </div>
      </div>

      <button
        onClick={handleTriggerDraw}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Processing...' : `Trigger ${drawType === 'random' ? 'Random' : 'Algorithmic'} Draw (${mode})`}
      </button>
    </div>
  )
}
