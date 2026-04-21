import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-2">404</p>
        <p className="text-5xl mb-4">⛳</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          This page doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Go home
          </Link>
          <Link href="/charities" className="px-5 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
            Browse charities
          </Link>
        </div>
      </div>
    </div>
  )
}
