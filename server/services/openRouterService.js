const axios = require('axios')
const crypto = require('crypto')
const { safeJsonParse } = require('../utils/safeJson')
const { retry } = require('../utils/retry')
const { MemoryCache } = require('../utils/cache')
const { openRouterLimiter } = require('../utils/throttles')

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY
  if (!key || key.includes('PASTE_')) {
    throw Object.assign(new Error('OPENROUTER_API_KEY is missing. Set it in server/.env.'), { statusCode: 500 })
  }
  return key
}

function getModel() {
  return process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4o-mini'
}

const cache = new MemoryCache({ ttlMs: 30 * 60_000, maxEntries: 300 })

function hashCacheKey(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

async function generateJson({ system, user }) {
  const messages = [
    system
      ? {
          role: 'system',
          content: `${system}\n\nReturn ONLY valid JSON. No markdown, no code fences, no extra keys.`,
        }
      : {
          role: 'system',
          content: 'Return ONLY valid JSON. No markdown, no code fences, no extra keys.',
        },
    { role: 'user', content: user || '' },
  ]

  const cacheKey = `openrouter:${getModel()}:${hashCacheKey(JSON.stringify(messages))}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const callOnce = async () => {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: getModel(),
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      },
      {
        timeout: 50_000,
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
          'X-Title': process.env.OPENROUTER_APP_NAME || 'AI Fact-Check Agent',
        },
      },
    )

    const text = response?.data?.choices?.[0]?.message?.content || ''
    const parsed = safeJsonParse(text)
    if (parsed == null) {
      const err = new Error('OpenRouter returned non-JSON output.')
      err.details = { text: text.slice(0, 1200) }
      throw err
    }
    if (Array.isArray(parsed)) return parsed

    const values = parsed && typeof parsed === 'object' ? Object.values(parsed) : []
    const onlyArray = values.length === 1 && Array.isArray(values[0]) ? values[0] : null
    return onlyArray || parsed
  }

  const run = async () =>
    openRouterLimiter.schedule(() =>
      retry(
        () => callOnce(),
        {
          label: 'openrouter.generateJson',
          retries: 4,
          baseDelayMs: 1200,
          timeoutMs: 50_000,
          onRetry: ({ attempt, delay, err }) => {
            // eslint-disable-next-line no-console
            console.warn(`[retry] openrouter attempt=${attempt} delayMs=${delay} err=${String(err?.message || err)}`.slice(0, 400))
          },
        },
      ),
    )

  const out = await run()
  cache.set(cacheKey, out)
  return out
}

module.exports = { generateJson }

