interface LoadingSkeletonProps {
  label: string
  rows?: number
}

export function LoadingSkeleton({ label, rows = 3 }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-2">
      <p className="mb-2 text-xs text-slate-500">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-8 animate-pulse rounded bg-slate-800"
          style={{ width: `${70 + (i % 3) * 10}%`, opacity: 1 - i * 0.15 }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
