'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-4">⛳</p>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          An unexpected error occurred on this page.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">ref: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Try again
          </button>
          <Link href="/" className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
