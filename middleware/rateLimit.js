const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimiter = (windowMs = 60000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(60000, 100, 'Too many API requests');

// Stricter rate limiter for authentication endpoints
const authLimiter = createRateLimiter(60000, 5, 'Too many authentication attempts');

// Very strict rate limiter for polling endpoints
const pollingLimiter = createRateLimiter(60000, 30, 'Too many polling requests');

module.exports = {
  apiLimiter,
  authLimiter,
  pollingLimiter,
  createRateLimiter
}; 