import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { Download, FileText, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ClaimCard } from '../components/ClaimCard.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { downloadJson } from '../utils/download.js'
import { generatePdfReport } from '../utils/reportPdf.js'
import { computeAccuracy } from '../utils/scoring.js'

export function ResultsPage() {
  const navigate = useNavigate()
  const raw = sessionStorage.getItem('factcheck:lastResult')
  const result = raw ? JSON.parse(raw) : null

  const summary = useMemo(() => {
    if (!result?.verifications?.length) return null
    const counts = { VERIFIED: 0, INACCURATE: 0, FALSE: 0 }
    for (const v of result.verifications) counts[v.verdict] = (counts[v.verdict] || 0) + 1
    const accuracy = computeAccuracy(result.verifications)
    return { counts, total: result.verifications.length, accuracy }
  }, [result])

  function onDownloadJson() {
    if (!result) return
    downloadJson(result, 'fact-check-result.json')
    toast.success('Downloaded JSON.')
  }

  async function onDownloadPdf() {
    if (!result) return
    await generatePdfReport(result)
    toast.success('Downloaded PDF report.')
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto glass rounded-3xl p-6">
        <div className="text-white font-semibold">No results yet</div>
        <div className="mt-2 text-sm text-zinc-300">
          Upload a PDF to generate a fact-check report.
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="rounded-2xl px-4 py-2 bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition"
          >
            Go to upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Results Dashboard</h2>
          <div className="mt-1 text-sm text-zinc-300">
            {result.file?.originalName ? (
              <>
                <span className="text-zinc-400">PDF:</span> <span className="text-white">{result.file.originalName}</span>
              </>
            ) : (
              'Fact-check report'
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 glass text-white hover:bg-white/10 transition"
          >
            <RefreshCcw className="h-4 w-4" />
            New upload
          </button>
          <button
            type="button"
            onClick={onDownloadJson}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 glass text-white hover:bg-white/10 transition"
          >
            <Download className="h-4 w-4" />
            JSON
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition"
          >
            <FileText className="h-4 w-4" />
            PDF report
          </button>
        </div>
      </div>

      {summary ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard label="Total claims" value={summary.total} tone="neutral" />
          <StatCard label="Accuracy score" value={`${summary.accuracy}%`} tone="good" />
          <StatCard label="Verified" value={summary.counts.VERIFIED} tone="verified" />
          <StatCard label="Inaccurate / False" value={summary.counts.INACCURATE + summary.counts.FALSE} tone="warn" />
        </motion.div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {result.verifications?.map((v, idx) => (
          <ClaimCard key={`${idx}-${v.claim?.slice(0, 12)}`} verification={v} />
        ))}
      </div>
    </div>
  )
}

