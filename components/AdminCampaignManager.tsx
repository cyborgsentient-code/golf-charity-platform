'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string; title: string; description: string | null; charity_id: string | null
  target_amount: number | null; raised_amount: number; start_date: string
  end_date: string | null; is_active: boolean; charities?: { name: string }
}
interface Charity { id: string; name: string }

const empty = { title: '', description: '', charity_id: '', target_amount: '', start_date: '', end_date: '', is_active: false }

export default function AdminCampaignManager({ initialCampaigns, charities }: { initialCampaigns: Campaign[]; charities: Charity[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [form, setForm] = useState<any>(empty)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreate = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, target_amount: form.target_amount ? parseFloat(form.target_amount) : null, charity_id: form.charity_id || null, end_date: form.end_date || null })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const created = await res.json()
      setCampaigns([created, ...campaigns])
      setForm(empty); setCreating(false)
      router.refresh()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const handleToggle = async (campaign: Campaign) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, is_active: !campaign.is_active })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated = await res.json()
      setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c))
      router.refresh()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/campaigns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setCampaigns(campaigns.filter(c => c.id !== id))
      router.refresh()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!creating && (
        <button onClick={() => setCreating(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          + New Campaign
        </button>
      )}

      {creating && (
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
          <h3 className="font-semibold">New Campaign</h3>
          <input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.charity_id} onChange={e => setForm({ ...form, charity_id: e.target.value })}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm">
              <option value="">No specific charity</option>
              {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" placeholder="Target amount ($)" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Start Date *</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Activate immediately
          </label>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={loading || !form.title || !form.start_date}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              {loading ? 'Saving...' : 'Create Campaign'}
            </button>
            <button onClick={() => { setCreating(false); setForm(empty) }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No campaigns yet</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <div key={c.id} className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{c.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {c.charities?.name && <p className="text-sm text-gray-500 dark:text-gray-400">Charity: {c.charities.name}</p>}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {c.start_date}{c.end_date ? ` → ${c.end_date}` : ''}
                    {c.target_amount ? ` · Target: $${c.target_amount}` : ''}
                  </p>
                  {c.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{c.description}</p>}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => handleToggle(c)} disabled={loading}
                    className={`text-sm hover:underline ${c.is_active ? 'text-yellow-600' : 'text-green-600'}`}>
                    {c.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
