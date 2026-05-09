const rateLimit = require('express-rate-limit')

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait and retry.' },
})

module.exports = { apiLimiter }

