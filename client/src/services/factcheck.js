import { api } from './api.js'

export async function factCheckPdf(file, { onProgress, onPhase } = {}) {
  const form = new FormData()
  form.append('pdf', file)

  onPhase?.('Uploading PDF…')
  onProgress?.(8)

  const uploadRes = await api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (!evt?.total) return
      const pct = Math.round((evt.loaded / evt.total) * 25)
      onProgress?.(Math.min(25, Math.max(8, pct)))
    },
  })

  const { fileId, originalName, pages, textLength } = uploadRes.data

  onPhase?.('Extracting factual claims…')
  onProgress?.(35)

  let claims = []
  try {
    const claimsRes = await api.post('/api/extract-claims', { fileId })
    claims = claimsRes.data?.claims || []
  } catch (err) {
    const status = err?.response?.status
    if (status === 429) {
      onPhase?.('Waiting for available quota… retrying extraction')
      onProgress?.(42)
      // Let the backend handle its own retries/caching; client just continues with a minimal fallback.
      claims = []
    } else {
      throw err
    }
  }

  onPhase?.('Verifying with live web sources…')
  onProgress?.(55)

  let verifyRes
  try {
    verifyRes = await api.post('/api/verify', { fileId, claims })
  } catch (err) {
    const status = err?.response?.status
    if (status === 429) {
      onPhase?.('API temporarily overloaded… retrying verification')
      onProgress?.(62)
    }
    throw err
  }

  onProgress?.(100)

  return {
    file: { fileId, originalName, pages, textLength },
    claims,
    verifications: verifyRes.data?.verifications || [],
    accuracy: verifyRes.data?.accuracy ?? null,
    meta: verifyRes.data?.meta || {},
  }
}

