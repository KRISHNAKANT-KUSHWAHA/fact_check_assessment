const fs = require('fs')
const { PDFParse, VerbosityLevel } = require('pdf-parse')

const { fileStore } = require('../services/fileStore')
const { extractClaimsFromText, verifyAllClaims } = require('../services/factcheckService')
const { searchWeb } = require('../services/tavilyService')
const { computeAccuracy } = require('../utils/scoring')
const { processInBatches } = require('../utils/batchProcessor')

const MAX_TEXT_CHARS_FOR_AI = 40_000

async function parsePdfFromDisk(filePath) {
  const buffer = await fs.promises.readFile(filePath)
  const parser = new PDFParse({ data: buffer, verbosity: VerbosityLevel.ERRORS })
  try {
    const data = await parser.getText()
    return {
      text: data?.text || '',
      pages: data?.total || null,
      pageTexts: Array.isArray(data?.pages)
        ? data.pages.map((p) => ({ page: p.num, text: p.text }))
        : [],
    }
  } finally {
    await parser.destroy().catch(() => {})
  }
}

function clampText(text) {
  const t = String(text || '')
  if (t.length <= MAX_TEXT_CHARS_FOR_AI) return t
  return t.slice(0, MAX_TEXT_CHARS_FOR_AI)
}

async function uploadController(req, res, next) {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'Missing pdf file field "pdf".' })
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Only PDFs are supported.' })

    const fileId = fileStore.create({
      path: file.path,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })

    // Parse once at upload time so later steps are fast
    const parsed = await parsePdfFromDisk(file.path)
    const cleanedText = (parsed.text || '').trim()
    if (!cleanedText) return res.status(400).json({ error: 'PDF contains no extractable text.' })

    fileStore.update(fileId, {
      pages: parsed.pages,
      text: cleanedText,
      textLength: cleanedText.length,
    })

    res.json({
      fileId,
      originalName: file.originalname,
      pages: parsed.pages,
      textLength: cleanedText.length,
    })
  } catch (err) {
    next(err)
  }
}

async function extractClaimsController(req, res, next) {
  try {
    const { fileId } = req.body || {}
    if (!fileId) return res.status(400).json({ error: 'Missing fileId.' })

    const meta = fileStore.get(fileId)
    if (!meta) return res.status(404).json({ error: 'Unknown fileId.' })

    let text = meta.text
    if (!text) {
      const parsed = await parsePdfFromDisk(meta.path)
      text = (parsed.text || '').trim()
      if (!text) return res.status(400).json({ error: 'PDF contains no extractable text.' })
      fileStore.update(fileId, { text, pages: parsed.pages, textLength: text.length })
    }

    const claims = await extractClaimsFromText(clampText(text))
    res.json({ claims })
  } catch (err) {
    next(err)
  }
}

async function verifyController(req, res, next) {
  try {
    const { fileId, claims } = req.body || {}
    if (!fileId) return res.status(400).json({ error: 'Missing fileId.' })

    const meta = fileStore.get(fileId)
    if (!meta) return res.status(404).json({ error: 'Unknown fileId.' })

    const list = Array.isArray(claims) ? claims : []
    if (!list.length) return res.status(400).json({ error: 'Missing claims array.' })

    // 1) Tavily searches (throttled to 1/sec and cached inside tavilyService)
    const sourcesByClaim = new Map()

    // If there are many claims, we still keep searches moving but avoid spikes.
    await processInBatches(list, {
      batchSize: 10,
      handler: async (batch) => {
        const tasks = batch.map(async (item) => {
          const claim = typeof item === 'string' ? item : item?.claim
          if (!claim || String(claim).trim().length < 8) {
            sourcesByClaim.set(String(claim || ''), [])
            return
          }
          const src = await searchWeb(String(claim), { maxResults: 5 })
          sourcesByClaim.set(String(claim), src)
        })
        await Promise.all(tasks)
        return []
      },
    })

    // 2) ONE Gemini verification per batch (<=10), not per claim
    const verifications = await verifyAllClaims({ claims: list, sourcesByClaim, batchSize: 10 })

    const accuracy = computeAccuracy(verifications)

    res.json({
      verifications,
      accuracy,
      meta: {
        fileId,
        originalName: meta.originalName,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  uploadController,
  extractClaimsController,
  verifyController,
}

