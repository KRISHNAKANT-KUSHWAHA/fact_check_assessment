function rateLimit({ windowMs, max }) {
  const hits = new Map()

  function cleanup(now) {
    for (const [key, v] of hits.entries()) {
      if (now - v.start > windowMs) hits.delete(key)
    }
  }

  return (req, res, next) => {
    const now = Date.now()
    cleanup(now)
    const key = req.ip || 'unknown'
    const cur = hits.get(key)
    if (!cur || now - cur.start > windowMs) {
      hits.set(key, { start: now, count: 1 })
      return next()
    }
    cur.count += 1
    if (cur.count > max) {
      res.status(429).json({ error: 'Too many requests. Please slow down.' })
      return
    }
    next()
  }
}

module.exports = { rateLimit }

