const axios = require('axios')
const { retry } = require('../utils/retry')
const { MemoryCache } = require('../utils/cache')
const { tavilyLimiter } = require('../utils/throttles')

const cache = new MemoryCache({ ttlMs: 60 * 60_000, maxEntries: 1000 })

async function searchWeb(query, { maxResults = 5 } = {}) {
  const key = process.env.TAVILY_API_KEY
  if (!key || key.includes('PASTE_')) {
    // allow local UI testing without keys: return empty sources
    return []
  }

  const q = String(query || '').trim()
  const cacheKey = `tavily:${q.toLowerCase()}:${maxResults}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const url = 'https://api.tavily.com/search'
  const body = {
    api_key: key,
    query: q,
    search_depth: 'advanced',
    include_answer: false,
    include_raw_content: false,
    max_results: Math.min(10, Math.max(1, Number(maxResults) || 5)),
  }

  try {
    const res = await tavilyLimiter.schedule(() =>
      retry(
        () => axios.post(url, body, { timeout: 30_000 }),
        {
          label: 'tavily.search',
          retries: 3,
          baseDelayMs: 1000,
          timeoutMs: 35_000,
        },
      ),
    )
    const results = res.data?.results || []
    const mapped = results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    }))
    cache.set(cacheKey, mapped)
    return mapped
  } catch (err) {
    return []
  }
}

module.exports = { searchWeb }

