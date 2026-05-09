async function processInBatches(items, { batchSize = 10, handler }) {
  if (!Array.isArray(items) || !items.length) return []
  const out = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    // eslint-disable-next-line no-await-in-loop
    const res = await handler(batch, { batchIndex: Math.floor(i / batchSize) })
    out.push(...(res || []))
  }
  return out
}

module.exports = { processInBatches }

async function processInBatches(items, { batchSize = 10, handler }) {
  if (!Array.isArray(items) || !items.length) return []
  const out = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    // eslint-disable-next-line no-await-in-loop
    const res = await handler(batch, { batchIndex: Math.floor(i / batchSize) })
    out.push(...(res || []))
  }
  return out
}

module.exports = { processInBatches }

