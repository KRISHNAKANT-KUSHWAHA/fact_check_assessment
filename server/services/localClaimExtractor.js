function uniq(arr) {
  return [...new Set(arr)]
}

function extractCandidateSentences(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  if (!t) return []
  return t
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20 && s.length <= 220)
}

function scoreSentence(s) {
  let score = 0
  if (/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/.test(s)) score += 3
  if (/%/.test(s)) score += 2
  if (/\b(19|20)\d{2}\b/.test(s)) score += 2
  if (/\b(USD|\$|million|billion|trillion|€|₹|INR)\b/i.test(s)) score += 2
  if (/\b(study|research|report|survey|paper|meta-analysis|trial)\b/i.test(s)) score += 1
  if (/\b(according to|data from|estimated|reported)\b/i.test(s)) score += 1
  return score
}

function localExtractClaims(text, { maxClaims = 18 } = {}) {
  const sentences = extractCandidateSentences(text)
  const scored = sentences
    .map((s) => ({ s, score: scoreSentence(s) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxClaims * 2)

  const claims = uniq(scored.map((x) => x.s))
    .slice(0, maxClaims)
    .map((claim) => ({
      claim,
      type: /%/.test(claim) || /\b\d/.test(claim) ? 'statistic' : /\b(19|20)\d{2}\b/.test(claim) ? 'date' : 'other',
      confidence: 0.55,
    }))

  return claims
}

module.exports = { localExtractClaims }

