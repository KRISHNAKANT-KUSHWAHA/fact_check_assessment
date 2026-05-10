const { generateJson } = require('./openRouterService')
const { processInBatches } = require('../utils/batchProcessor')
const { localExtractClaims } = require('./localClaimExtractor')

async function extractClaimsFromText(text) {
  const system = `You are a meticulous fact-checking analyst.
Extract ONLY checkable factual claims from the given PDF text. Focus on:
- Statistics, numbers, percentages
- Dates/time claims
- Financial/market metrics
- Technical/scientific claims
- Research findings stated as facts

Ignore:
- Opinions, marketing language, generic statements, vague claims, predictions without measurable detail.

Output MUST be a JSON array. Each element:
{ "claim": string, "type": "statistic"|"date"|"financial"|"technical"|"research"|"other", "confidence": number }`

  const user = `PDF TEXT (may be partial):\n${text}\n\nReturn 8-25 best claims.`

  let json
  try {
    json = await generateJson({ system, user })
  } catch (err) {
    const msg = String(err?.message || err || '')
    if (msg.includes('[429') || msg.toLowerCase().includes('quota')) {
      return localExtractClaims(text, { maxClaims: 18 })
    }
    throw err
  }
  if (!Array.isArray(json)) return localExtractClaims(text, { maxClaims: 18 })

  const cleaned = json
    .map((c) => ({
      claim: String(c?.claim || '').trim(),
      type: String(c?.type || 'other').toLowerCase(),
      confidence: Number(c?.confidence || 0),
    }))
    .filter((c) => c.claim.length >= 12)
    .slice(0, 30)

  return cleaned
}

async function verifyClaimsWithSources(claimsWithSources) {
  const system = `You are a strict fact-checking engine.
Given a LIST of claims and web sources, decide a verdict PER claim:
- VERIFIED: sources clearly support the claim.
- INACCURATE: claim is directionally related but contains wrong/missing specifics (numbers/dates/units).
- FALSE: sources contradict the claim.

Output STRICT JSON ARRAY (same order). Each element:
{
  "claim": string,
  "verdict": "VERIFIED"|"INACCURATE"|"FALSE",
  "confidence": number, // 0-100
  "reasoning": string,
  "corrected_fact": string,
  "sources": Array<{ "title": string, "url": string }>
}`

  const user = `INPUT JSON:\n${JSON.stringify(
    claimsWithSources.map((x) => ({
      claim: x.claim,
      sources: (x.sources || []).slice(0, 5).map((s) => ({
        title: s.title,
        url: s.url,
        content: s.content,
        score: s.score,
      })),
    })),
    null,
    2,
  )}`

  const json = await generateJson({ system, user })
  if (!Array.isArray(json)) throw new Error('OpenRouter verification did not return a JSON array.')
  return json
}

function normalizeVerification(json, claim, sources) {
  const v = json && typeof json === 'object' ? json : {}
  const verdict = String(v.verdict || '').toUpperCase()
  const allowed = new Set(['VERIFIED', 'INACCURATE', 'FALSE'])
  const safeVerdict = allowed.has(verdict) ? verdict : 'INACCURATE'
  const conf = Math.max(0, Math.min(100, Number(v.confidence || 0)))

  const src =
    Array.isArray(v.sources) && v.sources.length
      ? v.sources
      : (Array.isArray(sources) ? sources : []).slice(0, 4).map((s) => ({ title: s.title, url: s.url }))

  return {
    claim: String(v.claim || claim || '').trim(),
    verdict: safeVerdict,
    confidence: conf || (safeVerdict === 'VERIFIED' ? 85 : safeVerdict === 'FALSE' ? 80 : 70),
    reasoning: String(v.reasoning || '').trim(),
    corrected_fact: String(v.corrected_fact || '').trim(),
    sources: src
      .map((s) => ({ title: String(s?.title || '').trim(), url: String(s?.url || '').trim() }))
      .filter((s) => s.url)
      .slice(0, 8),
  }
}

async function verifyAllClaims({ claims, sourcesByClaim, batchSize = 10 }) {
  const items = claims.map((c) => ({
    claim: typeof c === 'string' ? c : c.claim,
    sources: sourcesByClaim.get(typeof c === 'string' ? c : c.claim) || [],
  }))

  const out = await processInBatches(items, {
    batchSize,
    handler: async (batch) => {
      try {
        const json = await verifyClaimsWithSources(batch)
        return json.map((o, idx) => normalizeVerification(o, batch[idx].claim, batch[idx].sources))
      } catch (err) {
        const msg = String(err?.message || err || '').slice(0, 900)
        return batch.map((b) => ({
          claim: b.claim,
          verdict: 'INACCURATE',
          confidence: 60,
          reasoning: `Verification delayed due to temporary API overload/rate limits.\n\n${msg}`,
          corrected_fact: '',
          sources: (b.sources || []).slice(0, 4).map((s) => ({ title: s.title, url: s.url })),
        }))
      }
    },
  })

  return out
}

module.exports = { extractClaimsFromText, verifyAllClaims }

