export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass p-6 space-y-3 ${className}`}>
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-8 w-1/2 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-4/5 rounded" />
    </div>
  )
}

export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 p-4 glass ${className}`}>
      <div className="skeleton h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <div className="skeleton h-6 w-16 rounded" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="stat-card">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-8 w-28 rounded" />
    </div>
  )
}
