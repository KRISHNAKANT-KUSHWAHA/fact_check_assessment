function safeJsonParse(text) {
  if (text == null) return null
  const raw = String(text).trim()
  if (!raw) return null

  // Fast path
  try {
    return JSON.parse(raw)
  } catch (_) {}

  // Try extract first JSON array/object region
  const startObj = raw.indexOf('{')
  const startArr = raw.indexOf('[')
  const start = startObj === -1 ? startArr : startArr === -1 ? startObj : Math.min(startObj, startArr)
  if (start === -1) return null

  const slice = raw.slice(start)
  // remove common fences
  const cleaned = slice.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (_) {
    // last attempt: balance braces/brackets
    const endObj = cleaned.lastIndexOf('}')
    const endArr = cleaned.lastIndexOf(']')
    const end = Math.max(endObj, endArr)
    if (end > 0) {
      const sub = cleaned.slice(0, end + 1)
      try {
        return JSON.parse(sub)
      } catch (_) {}
    }
  }
  return null
}

module.exports = { safeJsonParse }

