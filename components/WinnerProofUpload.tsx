'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DrawResult } from '@/lib/types'

interface WinnerProofUploadProps {
  drawResult: DrawResult
  onSuccess?: () => void
}

export default function WinnerProofUpload({ drawResult, onSuccess }: WinnerProofUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!drawResult.prize_tier) return null

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-green-800 dark:text-green-400 text-sm">✓ Proof submitted successfully! Awaiting admin verification.</p>
      </div>
    )
  }

  if (drawResult.verification_status === 'pending') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-400 text-sm">⏳ Verification pending. Your proof is under review.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      // Upload file to Supabase Storage
      const ext = file.name.split('.').pop()
      const path = `${drawResult.user_id}/${drawResult.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('winner-proofs')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(path)

      // Submit verification
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_result_id: drawResult.id, proof_image_url: publicUrl }),
      })

      if (!res.ok) throw new Error((await res.json()).error)

      setSuccess(true)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h4 className="font-semibold text-sm mb-1">🏆 You Won! Submit Proof</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Prize: ${drawResult.prize_amount?.toFixed(2) || '0.00'} — Upload a screenshot of your scores.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        <input
          type="file"
          accept="image/*"
          required
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition"
        >
          {loading ? 'Uploading...' : 'Submit Proof'}
        </button>
      </form>
    </div>
  )
}
