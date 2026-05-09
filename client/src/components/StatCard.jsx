const tones = {
  neutral: 'bg-white/[0.06] border-white/10',
  good: 'bg-teal-500/10 border-teal-300/20',
  verified: 'bg-emerald-500/10 border-emerald-300/20',
  warn: 'bg-amber-500/10 border-amber-300/20',
  bad: 'bg-rose-500/10 border-rose-300/20',
}

export function StatCard({ label, value, tone = 'neutral' }) {
  return (
    <div className={['rounded-3xl border p-5', tones[tone] || tones.neutral].join(' ')}>
      <div className="text-xs text-zinc-300/90">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

