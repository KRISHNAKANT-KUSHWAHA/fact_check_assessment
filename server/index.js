const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const dotenv = require('dotenv')
const path = require('path')

const { factcheckRouter } = require('./routes/factcheckRoutes')
const { errorHandler, notFound } = require('./middleware/errorMiddleware')
const { rateLimit } = require('./middleware/rateLimit')
const { apiLimiter } = require('./middleware/expressRateLimit')

dotenv.config()

const app = express()

app.set('trust proxy', 1)

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = (process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
      if (!origin) return cb(null, true)
      if (!allowed.length) return cb(null, true)
      if (allowed.includes(origin)) return cb(null, true)
      return cb(new Error('CORS blocked'), false)
    },
    credentials: true,
  }),
)

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ai-fact-check-agent',
    time: new Date().toISOString(),
  })
})

app.use('/api', rateLimit({ windowMs: 60_000, max: 120 }))
app.use('/api', apiLimiter)
app.use('/api', factcheckRouter)

// Expose uploads only for local debugging (disabled in production by default)
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
}

app.use(notFound)
app.use(errorHandler)

const port = Number(process.env.PORT || 5000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`)
})

