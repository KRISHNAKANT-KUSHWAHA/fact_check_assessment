import { motion } from 'framer-motion'
import { ExternalLink, ShieldCheck, TriangleAlert, XCircle } from 'lucide-react'

function VerdictBadge({ verdict }) {
  const v = (verdict || '').toUpperCase()
  const base = 'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border'
  if (v === 'VERIFIED')
    return (
      <span className={`${base} bg-emerald-500/10 border-emerald-300/20 text-emerald-100`}>
        <ShieldCheck className="h-4 w-4 text-emerald-200" />
        VERIFIED
      </span>
    )
  if (v === 'INACCURATE')
    return (
      <span className={`${base} bg-amber-500/10 border-amber-300/20 text-amber-100`}>
        <TriangleAlert className="h-4 w-4 text-amber-200" />
        INACCURATE
      </span>
    )
  return (
    <span className={`${base} bg-rose-500/10 border-rose-300/20 text-rose-100`}>
      <XCircle className="h-4 w-4 text-rose-200" />
      FALSE
    </span>
  )
}

export function ClaimCard({ verification }) {
  const sources = Array.isArray(verification?.sources) ? verification.sources : []
  const confidence = Number(verification?.confidence || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-strong rounded-3xl p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <VerdictBadge verdict={verification?.verdict} />
        <div className="text-xs text-zinc-300">
          Confidence: <span className="text-white font-semibold">{Math.round(confidence)}%</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-zinc-400">Original claim</div>
        <div className="mt-1 text-white font-semibold leading-relaxed">{verification?.claim}</div>
      </div>

      {verification?.corrected_fact ? (
        <div className="mt-4 rounded-2xl bg-black/30 border border-white/10 p-4">
          <div className="text-xs text-zinc-400">Corrected fact</div>
          <div className="mt-1 text-sm text-zinc-100 leading-relaxed">{verification.corrected_fact}</div>
        </div>
      ) : null}

      {verification?.reasoning ? (
        <div className="mt-4">
          <div className="text-xs text-zinc-400">Reasoning</div>
          <div className="mt-1 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {verification.reasoning}
          </div>
        </div>
      ) : null}

      {sources.length ? (
        <div className="mt-4">
          <div className="text-xs text-zinc-400">Sources</div>
          <div className="mt-2 flex flex-col gap-2">
            {sources.slice(0, 6).map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{s.title || s.url}</div>
                    <div className="mt-1 text-xs text-zinc-400 truncate">{s.url}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-300 shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}

