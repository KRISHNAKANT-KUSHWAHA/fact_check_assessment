const crypto = require('crypto')
const fs = require('fs')

const TTL_MS = 30 * 60 * 1000

function now() {
  return Date.now()
}

class FileStore {
  constructor() {
    this._map = new Map()
    setInterval(() => this.cleanup(), 60_000).unref?.()
  }

  create(meta) {
    const id = crypto.randomBytes(16).toString('hex')
    this._map.set(id, {
      ...meta,
      createdAt: now(),
    })
    return id
  }

  get(id) {
    const v = this._map.get(id)
    if (!v) return null
    if (now() - v.createdAt > TTL_MS) {
      this._delete(id)
      return null
    }
    return v
  }

  update(id, patch) {
    const v = this._map.get(id)
    if (!v) return
    this._map.set(id, { ...v, ...patch })
  }

  _delete(id) {
    const v = this._map.get(id)
    this._map.delete(id)
    if (v?.path) {
      fs.promises.unlink(v.path).catch(() => {})
    }
  }

  cleanup() {
    for (const [id, v] of this._map.entries()) {
      if (now() - v.createdAt > TTL_MS) {
        this._delete(id)
      }
    }
  }
}

const fileStore = new FileStore()

module.exports = { fileStore }

