function now() {
  return Date.now()
}

class MemoryCache {
  constructor({ ttlMs = 10 * 60_000, maxEntries = 500 } = {}) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
    this.map = new Map()
  }

  _prune() {
    const t = now()
    for (const [k, v] of this.map.entries()) {
      if (t > v.expiresAt) this.map.delete(k)
    }
    if (this.map.size <= this.maxEntries) return
    // naive prune: drop oldest
    const entries = [...this.map.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)
    const toDrop = Math.max(0, this.map.size - this.maxEntries)
    for (let i = 0; i < toDrop; i++) this.map.delete(entries[i][0])
  }

  get(key) {
    const v = this.map.get(key)
    if (!v) return null
    if (now() > v.expiresAt) {
      this.map.delete(key)
      return null
    }
    return v.value
  }

  set(key, value, ttlMs) {
    this._prune()
    const t = now()
    this.map.set(key, { value, createdAt: t, expiresAt: t + (ttlMs ?? this.ttlMs) })
  }
}

module.exports = { MemoryCache }

