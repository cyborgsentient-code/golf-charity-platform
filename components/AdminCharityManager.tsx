'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Charity {
  id: string; name: string; description: string | null; long_description: string | null
  image_url: string | null; website_url: string | null; country: string
  is_active: boolean; is_featured: boolean
}
interface Event { id: string; title: string; event_date: string; location: string | null; description: string | null }

const emptyCharity = { name: '', description: '', long_description: '', image_url: '', website_url: '', country: 'US', is_active: true, is_featured: false }
const emptyEvent = { title: '', event_date: '', location: '', description: '' }

export default function AdminCharityManager({ initialCharities }: { initialCharities: Charity[] }) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities)
  const [editing, setEditing] = useState<Charity | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<any>(emptyCharity)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eventsCharityId, setEventsCharityId] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [eventForm, setEventForm] = useState<any>(emptyEvent)
  const [eventLoading, setEventLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      if (creating) {
        const res = await fetch('/api/admin/charities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error((await res.json()).error)
        const created = await res.json()
        setCharities([...charities, created])
        setCreating(false)
      } else if (editing) {
        const res = await fetch(`/api/admin/charities/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error((await res.json()).error)
        const updated = await res.json()
        setCharities(charities.map(c => c.id === updated.id ? updated : c))
        setEditing(null)
      }
      setForm(emptyCharity)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this charity? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/charities/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setCharities(charities.filter(c => c.id !== id))
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (charity: Charity) => { setEditing(charity); setCreating(false); setForm({ ...charity }) }
  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyCharity) }
  const cancel = () => { setEditing(null); setCreating(false); setForm(emptyCharity); setError('') }

  const loadEvents = async (charityId: string) => {
    if (eventsCharityId === charityId) { setEventsCharityId(null); return }
    const res = await fetch(`/api/admin/charities/${charityId}/events`)
    const data = await res.json()
    setEvents(data)
    setEventsCharityId(charityId)
    setEventForm(emptyEvent)
  }

  const handleAddEvent = async (charityId: string) => {
    setEventLoading(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, charity_id: charityId })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const created = await res.json()
      setEvents([...events, created])
      setEventForm(emptyEvent)
    } catch (err: any) { alert(err.message) } finally { setEventLoading(false) }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event?')) return
    setEventLoading(true)
    try {
      const res = await fetch('/api/admin/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: eventId }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setEvents(events.filter(e => e.id !== eventId))
    } catch (err: any) { alert(err.message) } finally { setEventLoading(false) }
  }

  const FormFields = () => (
    <div className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {[
        { label: 'Name *', key: 'name', type: 'text' },
        { label: 'Description', key: 'description', type: 'text' },
        { label: 'Image URL', key: 'image_url', type: 'url' },
        { label: 'Website URL', key: 'website_url', type: 'url' },
        { label: 'Country (2-letter)', key: 'country', type: 'text' },
      ].map(({ label, key, type }) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <input type={type} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium mb-1">Long Description</label>
        <textarea rows={3} value={form.long_description || ''} onChange={e => setForm({ ...form, long_description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading || !form.name}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button onClick={cancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">Cancel</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {!creating && !editing && (
        <button onClick={startCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          + Add Charity
        </button>
      )}

      {(creating || editing) && (
        <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold mb-3">{creating ? 'New Charity' : `Edit: ${editing?.name}`}</h3>
          <FormFields />
        </div>
      )}

      <div className="space-y-3">
        {charities.map(charity => (
          <div key={charity.id}>
            <div className="border dark:border-gray-700 rounded-lg p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{charity.name}</p>
                  {charity.is_featured && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">Featured</span>}
                  {!charity.is_active && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">Inactive</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{charity.description}</p>
                {charity.image_url && <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{charity.image_url}</p>}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => startEdit(charity)} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => loadEvents(charity.id)} className="text-sm text-purple-600 hover:underline">
                  {eventsCharityId === charity.id ? 'Hide Events' : 'Events'}
                </button>
                <button onClick={() => handleDelete(charity.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
            </div>

            {eventsCharityId === charity.id && (
            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">UPCOMING EVENTS</p>
              {events.length === 0 && <p className="text-sm text-gray-400 mb-2">No events yet</p>}
              <div className="space-y-2 mb-3">
                {events.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
                    <span className="font-medium">{e.title}</span>
                    <span className="text-gray-500 mx-2">{e.event_date}</span>
                    {e.location && <span className="text-gray-400 text-xs">{e.location}</span>}
                    <button onClick={() => handleDeleteEvent(e.id)} className="text-red-500 text-xs hover:underline ml-2">Remove</button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input placeholder="Title *" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" />
                <input type="date" value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                  className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" />
                <input placeholder="Location" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" />
                <button onClick={() => handleAddEvent(charity.id)} disabled={eventLoading || !eventForm.title || !eventForm.event_date}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                  {eventLoading ? '...' : '+ Add Event'}
                </button>
              </div>
            </div>
          )}
          </div>
        ))}
      </div>
    </div>
  )
}
