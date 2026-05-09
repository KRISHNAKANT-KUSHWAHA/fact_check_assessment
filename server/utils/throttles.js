const Bottleneck = require('bottleneck')

// Tavily: 1 request / second
const tavilyLimiter = new Bottleneck({
  minTime: 1000,
  maxConcurrent: 1,
})

// Gemini: keep it very conservative to avoid spikes
const geminiLimiter = new Bottleneck({
  minTime: 1200,
  maxConcurrent: 1,
})

module.exports = { tavilyLimiter, geminiLimiter }

