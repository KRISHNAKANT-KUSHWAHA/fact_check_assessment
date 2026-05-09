export function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)))
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-300 via-sky-300 to-violet-300 transition-all duration-300"
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

