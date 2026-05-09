import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Loader2, ShieldAlert, Wand2 } from 'lucide-react'
import { UploadDropzone } from '../components/UploadDropzone.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { factCheckPdf } from '../services/factcheck.js'

export function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('')
  const [progress, setProgress] = useState(0)

  const fileMeta = useMemo(() => {
    if (!file) return null
    return { name: file.name, sizeMb: (file.size / (1024 * 1024)).toFixed(2) }
  }, [file])

  async function onStart() {
    if (!file) {
      toast.error('Please select a PDF file.')
      return
    }
    setBusy(true)
    setProgress(5)
    setPhase('Uploading PDF…')

    try {
      const result = await factCheckPdf(file, {
        onPhase: (p) => setPhase(p),
        onProgress: (v) => setProgress(v),
      })

      sessionStorage.setItem('factcheck:lastResult', JSON.stringify(result))
      toast.success('Fact-check complete.')
      navigate('/results')
    } catch (err) {
      toast.error(err?.message || 'Something went wrong.')
    } finally {
      setBusy(false)
      setPhase('')
      setProgress(0)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Upload Dashboard</h2>
          <p className="mt-1 text-zinc-300 text-sm">
            Drag & drop a PDF. We’ll extract claims, verify against live sources, and generate a report.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-300 glass rounded-2xl px-3 py-2">
          <ShieldAlert className="h-4 w-4 text-amber-200" />
          Keys stay on server via env vars
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div className="glass-strong rounded-3xl p-5 sm:p-6">
          <UploadDropzone
            disabled={busy}
            file={file}
            onFile={(f) => setFile(f)}
            onClear={() => setFile(null)}
          />

          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={busy || !file}
              onClick={onStart}
              className={[
                'inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition',
                busy || !file
                  ? 'bg-white/10 text-white/60 cursor-not-allowed border border-white/10'
                  : 'bg-white text-zinc-900 hover:bg-zinc-100',
              ].join(' ')}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Run fact-check
                </>
              )}
            </button>

            <div className="text-xs text-zinc-400">
              Max file size enforced by server. PDF only.
            </div>
          </div>

          {busy ? (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <div>{phase || 'Processing…'}</div>
                <div>{Math.round(progress)}%</div>
              </div>
              <div className="mt-2">
                <ProgressBar value={progress} />
              </div>
            </div>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="h-4 w-4 text-sky-200" />
            Selected file
          </div>
          <div className="mt-3 rounded-2xl bg-black/30 border border-white/10 p-4">
            {fileMeta ? (
              <div className="space-y-1">
                <div className="text-sm text-white font-semibold break-all">{fileMeta.name}</div>
                <div className="text-xs text-zinc-400">{fileMeta.sizeMb} MB</div>
              </div>
            ) : (
              <div className="text-sm text-zinc-300">No PDF selected yet.</div>
            )}
          </div>

          <div className="mt-4 text-xs text-zinc-400 leading-relaxed">
            We focus on factual, checkable claims (statistics, dates, percentages, financial and technical assertions).
            Opinions and marketing language are ignored.
          </div>
        </motion.div>
      </div>
    </div>
  )
}

