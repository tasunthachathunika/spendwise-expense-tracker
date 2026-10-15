const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (login & register)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Rate limiter for account deletion (strict 5 attempts per 15 minutes)
const deleteAccountRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many account deletion attempts. Please try again after 15 minutes.',
  },
});

// Rate limiter for notifications (120 requests per minute)
const notificationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many notification requests. Please try again in a moment.',
  },
});

// Standard security headers middleware using Helmet
const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Let frontend handle inline styles and SVGs safely
});

module.exports = {
  authRateLimiter,
  deleteAccountRateLimiter,
  notificationRateLimiter,
  securityHeaders,
};
