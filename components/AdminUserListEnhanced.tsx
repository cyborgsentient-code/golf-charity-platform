'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Score { id: string; value: number; score_date: string }

export default function AdminUserListEnhanced({ profiles }: { profiles: Profile[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [scoresUserId, setScoresUserId] = useState<string | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)
  const [scoreEdit, setScoreEdit] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEdit = (profile: Profile) => {
    setEditingId(profile.id)
    setEditData({ full_name: profile.full_name || '', subscription_status: profile.subscription_status })
  }

  const handleSave = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) })
      if (!res.ok) throw new Error('Failed to update')
      setEditingId(null)
      router.refresh()
    } catch { alert('Failed to update user') } finally { setLoading(false) }
  }

  const loadScores = async (userId: string) => {
    if (scoresUserId === userId) { setScoresUserId(null); return }
    const res = await fetch(`/api/admin/users/${userId}/scores`)
    const data = await res.json()
    setScores(data)
    setScoresUserId(userId)
    setEditingScoreId(null)
  }

  const handleScoreSave = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/scores`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score_id: editingScoreId, value: parseInt(scoreEdit.value), score_date: scoreEdit.score_date })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated = await res.json()
      setScores(scores.map(s => s.id === editingScoreId ? updated : s))
      setEditingScoreId(null)
    } catch (err: any) { alert(err.message) } finally { setLoading(false) }
  }

  const handleScoreDelete = async (userId: string, scoreId: string) => {
    if (!confirm('Delete this score?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/scores`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score_id: scoreId })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setScores(scores.filter(s => s.id !== scoreId))
    } catch (err: any) { alert(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {['User', 'Email', 'Status', 'Admin', 'Actions'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {profiles.map((profile) => (
            <>
              <tr key={profile.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === profile.id
                    ? <input type="text" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    : <span className="font-medium">{profile.full_name || 'N/A'}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{profile.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === profile.id
                    ? <select value={editData.subscription_status} onChange={e => setEditData({ ...editData, subscription_status: e.target.value })} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm">
                        {['active', 'inactive', 'cancelled', 'past_due'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    : <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.subscription_status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'}`}>{profile.subscription_status}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{profile.is_admin ? <span className="text-blue-600">✓</span> : <span className="text-gray-400">-</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === profile.id
                    ? <div className="flex gap-2">
                        <button onClick={() => handleSave(profile.id)} disabled={loading} className="text-green-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                      </div>
                    : <div className="flex gap-3">
                        <button onClick={() => handleEdit(profile)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => loadScores(profile.id)} className="text-purple-600 hover:underline">
                          {scoresUserId === profile.id ? 'Hide Scores' : 'Scores'}
                        </button>
                      </div>}
                </td>
              </tr>

              {scoresUserId === profile.id && (
                <tr key={`${profile.id}-scores`}>
                  <td colSpan={5} className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">SCORES ({scores.length}/5)</p>
                    {scores.length === 0
                      ? <p className="text-sm text-gray-400">No scores</p>
                      : <div className="space-y-2">
                          {scores.map(score => (
                            <div key={score.id} className="flex items-center gap-3">
                              {editingScoreId === score.id
                                ? <>
                                    <input type="number" min="1" max="45" value={scoreEdit.value} onChange={e => setScoreEdit({ ...scoreEdit, value: e.target.value })} className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" />
                                    <input type="date" value={scoreEdit.score_date} onChange={e => setScoreEdit({ ...scoreEdit, score_date: e.target.value })} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" />
                                    <button onClick={() => handleScoreSave(profile.id)} disabled={loading} className="text-green-600 text-sm hover:underline">Save</button>
                                    <button onClick={() => setEditingScoreId(null)} className="text-gray-500 text-sm hover:underline">Cancel</button>
                                  </>
                                : <>
                                    <span className="text-sm font-bold text-blue-600 w-8">{score.value}</span>
                                    <span className="text-sm text-gray-500">{score.score_date}</span>
                                    <button onClick={() => { setEditingScoreId(score.id); setScoreEdit({ value: score.value, score_date: score.score_date }) }} className="text-blue-600 text-xs hover:underline">Edit</button>
                                    <button onClick={() => handleScoreDelete(profile.id, score.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                                  </>}
                            </div>
                          ))}
                        </div>}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
