'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Team { id: string; name: string; country: string; is_active: boolean }

export default function AdminTeamManager({ initialTeams }: { initialTeams: Team[] }) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [form, setForm] = useState({ name: '', country: 'US' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error((await res.json()).error)
      const created = await res.json()
      setTeams([...teams, created])
      setForm({ name: '', country: 'US' })
      router.refresh()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/teams', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setTeams(teams.filter(t => t.id !== id))
      router.refresh()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const countries = [['US','United States'],['GB','United Kingdom'],['IE','Ireland'],['AU','Australia'],['CA','Canada'],['ZA','South Africa'],['NZ','New Zealand'],['IN','India']]

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Team name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
        <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
          {countries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
        <button onClick={handleCreate} disabled={loading || !form.name.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">
          + Add Team
        </button>
      </div>
      {teams.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No teams yet</p>
      ) : (
        <div className="space-y-2">
          {teams.map(team => (
            <div key={team.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg px-4 py-3">
              <div>
                <span className="font-medium">{team.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{team.country}</span>
              </div>
              <button onClick={() => handleDelete(team.id)} className="text-red-600 text-sm hover:underline">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
