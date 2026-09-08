'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware — 100 requests per 15 minutes per IP.
 * Returns 429 with a JSON error body (not the default HTML response).
 */
const rateLimiter = rateLimit({
  windowMs:          15 * 60 * 1000, // 15 minutes
  max:               100,
  skip:              (req) => req.path === '/health',
  standardHeaders:   true,
  legacyHeaders:     false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests — please try again later' });
  },
});

module.exports = rateLimiter;
