export function computeAccuracy(verifications) {
  if (!Array.isArray(verifications) || !verifications.length) return 0
  let score = 0
  for (const v of verifications) {
    const verdict = String(v?.verdict || '').toUpperCase()
    if (verdict === 'VERIFIED') score += 1
    else if (verdict === 'INACCURATE') score += 0.5
    else score += 0
  }
  return Math.round((score / verifications.length) * 100)
}

