import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Trash2, UploadCloud } from 'lucide-react'

export function UploadDropzone({ file, onFile, onClear, disabled }) {
  const onDrop = useCallback(
    (accepted) => {
      const f = accepted?.[0]
      if (!f) return
      onFile(f)
    },
    [onFile],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 15 * 1024 * 1024, // client-side hint; server enforces too
  })

  const rejection = fileRejections?.[0]?.errors?.[0]?.message

  return (
    <div>
      <div
        {...getRootProps()}
        className={[
          'rounded-3xl border border-dashed p-6 sm:p-8 transition cursor-pointer select-none',
          'bg-black/30 border-white/15 hover:border-white/30',
          isDragActive ? 'ring-2 ring-violet-300/50 border-white/40' : '',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
            <UploadCloud className="h-6 w-6 text-sky-200" />
          </div>
          <div className="mt-4 text-white font-semibold">
            {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF, or click to select'}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            PDF only. Recommended ≤ 15MB.
          </div>
        </div>
      </div>

      {rejection ? (
        <div className="mt-2 text-xs text-rose-200">{rejection}</div>
      ) : null}

      {file ? (
        <div className="mt-4 rounded-2xl bg-black/30 border border-white/10 p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center shrink-0">
              <FileText className="h-5 w-5 text-teal-200" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{file.name}</div>
              <div className="text-xs text-zinc-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold glass hover:bg-white/10 transition disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4 text-zinc-200" />
            Clear
          </button>
        </div>
      ) : null}
    </div>
  )
}

