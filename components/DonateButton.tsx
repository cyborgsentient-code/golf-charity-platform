'use client'

import { useState } from 'react'

export default function DonateButton({ charityId, charityName }: { charityId: string; charityName: string }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const presets = [5, 10, 25, 50]

  const handleDonate = async () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed < 1) { setError('Minimum donation is $1'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charity_id: charityId, amount: parsed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
      >
        💚 Make a Donation
      </button>
    )
  }

  return (
    <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Donate to {charityName}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">One-time donation — independent of your subscription.</p>

      <div className="flex gap-2 flex-wrap">
        {presets.map(p => (
          <button key={p} onClick={() => setAmount(String(p))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              amount === String(p)
                ? 'bg-green-600 text-white border-green-600'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            }`}>
            ${p}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number" min="1" step="1" placeholder="Custom amount"
            value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full pl-7 pr-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button onClick={handleDonate} disabled={loading || !amount}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm transition">
          {loading ? 'Redirecting...' : `Donate $${amount || '0'}`}
        </button>
        <button onClick={() => { setOpen(false); setAmount(''); setError('') }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </div>
  )
}
