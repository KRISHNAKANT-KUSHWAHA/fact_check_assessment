const { sleep } = require('./sleep')

function isRetryableError(err) {
  const msg = String(err?.message || err || '')
  if (!msg) return false
  return (
    msg.includes('[429') ||
    msg.includes('Too Many Requests') ||
    msg.includes('quota') ||
    msg.includes('Quota exceeded') ||
    msg.includes('overloaded') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('EAI_AGAIN')
  )
}

function jitter(ms) {
  const j = Math.floor(Math.random() * Math.min(250, Math.max(0, ms * 0.1)))
  return ms + j
}

async function withTimeout(promise, ms, label = 'operation') {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(Object.assign(new Error(`${label} timed out after ${ms}ms`), { code: 'ETIMEDOUT' })), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(t)
  }
}

async function retry(fn, opts = {}) {
  const {
    retries = 4,
    baseDelayMs = 800,
    maxDelayMs = 12_000,
    timeoutMs = 40_000,
    label = 'request',
    onRetry,
  } = opts

  let attempt = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await withTimeout(Promise.resolve().then(fn), timeoutMs, label)
    } catch (err) {
      attempt += 1
      const retryable = isRetryableError(err)
      if (!retryable || attempt > retries) throw err

      const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1))
      const delay = jitter(backoff)
      onRetry?.({ attempt, delay, err })
      await sleep(delay)
    }
  }
}

module.exports = { retry, isRetryableError, withTimeout }

