const { GoogleGenerativeAI } = require('@google/generative-ai')
const { safeJsonParse } = require('../utils/safeJson')
const { retry } = require('../utils/retry')
const { MemoryCache } = require('../utils/cache')
const { geminiLimiter } = require('../utils/throttles')

function getClient() {
  const key = process.env.GEMINI_API_KEY
  if (!key || key.includes('PASTE_')) {
    throw Object.assign(new Error('GEMINI_API_KEY is missing. Set it in server/.env.'), { statusCode: 500 })
  }
  return new GoogleGenerativeAI(key)
}

function getModel() {
  const genAI = getClient()
  // Default requested by user. Some accounts may not have access; we fallback on 404.
  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash'
  return genAI.getGenerativeModel({ model: modelName })
}

const cache = new MemoryCache({ ttlMs: 30 * 60_000, maxEntries: 300 })

async function generateJson({ system, user }) {
  const prompt = [
    system ? `SYSTEM:\n${system}` : null,
    user ? `USER:\n${user}` : null,
    'Return ONLY valid JSON. No markdown, no code fences, no extra keys.',
  ]
    .filter(Boolean)
    .join('\n\n')

  const cacheKey = `gemini:${Buffer.from(prompt).toString('base64').slice(0, 500)}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const callOnce = async (modelNameOverride) => {
    const genAI = getClient()
    const model = genAI.getGenerativeModel({ model: modelNameOverride || (process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash') })
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })
    const text = result?.response?.text?.() || ''
    const parsed = safeJsonParse(text)
    if (parsed == null) {
      const err = new Error('Gemini returned non-JSON output.')
      err.details = { text: text.slice(0, 1200) }
      throw err
    }
    return parsed
  }

  const run = async () =>
    geminiLimiter.schedule(() =>
      retry(
        () => callOnce(),
        {
          label: 'gemini.generateJson',
          retries: 4,
          baseDelayMs: 1200,
          timeoutMs: 50_000,
          onRetry: ({ attempt, delay, err }) => {
            // eslint-disable-next-line no-console
            console.warn(`[retry] gemini attempt=${attempt} delayMs=${delay} err=${String(err?.message || err)}`.slice(0, 400))
          },
        },
      ),
    )

  try {
    const out = await run()
    cache.set(cacheKey, out)
    return out
  } catch (err) {
    const msg = String(err?.message || err || '')
    // Fallback for accounts where gemini-1.5-flash isn't available.
    if (msg.includes('[404') && msg.includes('is not found')) {
      const out = await geminiLimiter.schedule(() =>
        retry(() => callOnce('gemini-2.0-flash'), { label: 'gemini.fallback', retries: 3, baseDelayMs: 1500, timeoutMs: 50_000 }),
      )
      cache.set(cacheKey, out)
      return out
    }
    throw err
  }
}

module.exports = { generateJson }

