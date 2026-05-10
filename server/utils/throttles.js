const Bottleneck = require('bottleneck')

// Tavily: 1 request / second
const tavilyLimiter = new Bottleneck({
  minTime: 1000,
  maxConcurrent: 1,
})

// OpenRouter: keep it conservative to avoid spikes across routed providers
const openRouterLimiter = new Bottleneck({
  minTime: 1200,
  maxConcurrent: 1,
})

module.exports = { tavilyLimiter, openRouterLimiter }

