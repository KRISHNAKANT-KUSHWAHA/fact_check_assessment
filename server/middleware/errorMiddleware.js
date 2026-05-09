function notFound(req, res, next) {
  res.status(404).json({ error: 'Not found' })
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || err.status || 500
  const message = err.message || 'Server error'

  // Best-effort mapping for upstream API errors that come as message strings.
  if (status === 500 && typeof message === 'string') {
    if (message.includes('[429')) status = 429
    else if (message.includes('[401') || message.includes('[403')) status = 401
    else if (message.includes('[404')) status = 502
  }
  const payload = { error: message }
  if (process.env.NODE_ENV !== 'production' && err.details) payload.details = err.details
  res.status(status).json(payload)
}

module.exports = { errorHandler, notFound }

