'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">⛳</p>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4 font-mono">ref: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
