'use client'

import { Draw } from '@/lib/types'

interface AdminDrawListProps {
  draws: Draw[]
}

export default function AdminDrawList({ draws }: AdminDrawListProps) {
  if (draws.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        No draws yet. Trigger your first draw above.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {draws.map((draw) => (
        <div
          key={draw.id}
          className="border dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">
                {new Date(draw.draw_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Type: {draw.draw_type}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              draw.status === 'completed'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
            }`}>
              {draw.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Draw Numbers</p>
            <div className="flex gap-2">
              {draw.numbers.map((num, idx) => (
                <span
                  key={idx}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-medium"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
