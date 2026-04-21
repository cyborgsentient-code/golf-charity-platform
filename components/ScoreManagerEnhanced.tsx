'use client'

import { useState } from 'react'
import { Score } from '@/lib/types'

interface ScoreManagerEnhancedProps {
  userId: string
  initialScores: Score[]
}

export default function ScoreManagerEnhanced({ userId, initialScores }: ScoreManagerEnhancedProps) {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [value, setValue] = useState('')
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editDate, setEditDate] = useState('')

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(value),
          score_date: scoreDate
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      const newScore = await response.json()
      const updatedScores = [newScore, ...scores].slice(0, 5)
      setScores(updatedScores)
      
      setValue('')
      setScoreDate(new Date().toISOString().split('T')[0])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (score: Score) => {
    setEditingId(score.id)
    setEditValue(score.value.toString())
    setEditDate(score.score_date)
  }

  const handleSaveEdit = async (scoreId: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/scores/${scoreId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: parseInt(editValue),
          score_date: editDate
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      const updatedScore = await response.json()
      setScores(scores.map(s => s.id === scoreId ? updatedScore : s))
      setEditingId(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scoreId: string) => {
    if (!confirm('Delete this score?')) return

    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/scores/${scoreId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setScores(scores.filter(s => s.id !== scoreId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Your Scores (Max 5)</h2>
      
      <form onSubmit={handleAddScore} className="mb-6 space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="value" className="block text-sm font-medium mb-1">
              Score (1-45)
            </label>
            <input
              id="value"
              type="number"
              min="1"
              max="45"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="18"
            />
          </div>

          <div>
            <label htmlFor="scoreDate" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              id="scoreDate"
              type="date"
              required
              value={scoreDate}
              onChange={(e) => setScoreDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Adding...' : 'Add Score'}
            </button>
          </div>
        </div>

        {scores.length >= 5 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            You have 5 scores. Adding a new score will remove the oldest one.
          </p>
        )}
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          Current Scores ({scores.length}/5)
        </h3>
        
        {scores.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No scores yet. Add your first score above.
          </p>
        ) : (
          <div className="space-y-2">
            {scores.map((score) => (
              <div
                key={score.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between"
              >
                {editingId === score.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 text-sm"
                    />
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="px-2 py-1 border rounded dark:bg-gray-600 dark:border-gray-500 text-sm"
                    />
                    <button
                      onClick={() => handleSaveEdit(score.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-xl font-bold text-neon-green tabular">
                        {score.value}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                        {score.score_date}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(score)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
