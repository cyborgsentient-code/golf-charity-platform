'use client'

import { useState } from 'react'

export default function ManageSubscription() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="text-sm text-blue-600 hover:underline disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  )
}
