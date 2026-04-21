'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminWinnerVerification({ verifications }: { verifications: any[] }) {
  const [filter, setFilter] = useState<Filter>('pending')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const filtered = filter === 'all' ? verifications : verifications.filter(v => v.status === filter)
  const counts = {
    all: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  }

  const handleVerify = async (verificationId: string, approved: boolean) => {
    setError('')
    setLoading(verificationId)
    try {
      const res = await fetch('/api/verifications/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_id: verificationId, action: 'verify', approved })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleMarkPaid = async (verificationId: string) => {
    setError('')
    setLoading(verificationId)
    try {
      const res = await fetch('/api/verifications/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_id: verificationId, action: 'mark_paid' })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No {filter} verifications</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((v: any) => (
            <div key={v.id} className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{v.draw_results?.profiles?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{v.draw_results?.profiles?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Draw: {v.draw_results?.draws?.draw_date} · Prize: ${v.draw_results?.prize_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    v.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    : v.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>{v.status}</span>
                  {v.payment_status === 'paid' && (
                    <span className="text-xs text-green-600 dark:text-green-400">✓ Paid</span>
                  )}
                </div>
              </div>

              {v.proof_image_url && (
                <div className="mb-3">
                  <a href={v.proof_image_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline">View Proof Screenshot →</a>
                </div>
              )}

              {v.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(v.id, true)} disabled={loading === v.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">Approve</button>
                  <button onClick={() => handleVerify(v.id, false)} disabled={loading === v.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm">Reject</button>
                </div>
              )}

              {v.status === 'approved' && v.payment_status === 'pending' && (
                <button onClick={() => handleMarkPaid(v.id)} disabled={loading === v.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">Mark as Paid</button>
              )}

              {v.payment_status === 'paid' && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Paid on {new Date(v.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
