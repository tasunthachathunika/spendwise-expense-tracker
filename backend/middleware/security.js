// Lightweight in-memory rate limiter for authentication routes
const authAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 25; // max 25 attempts per window

// Clean expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of authAttempts.entries()) {
    if (now - data.startTime > WINDOW_MS) {
      authAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  const record = authAttempts.get(ip);
  if (!record || now - record.startTime > WINDOW_MS) {
    authAttempts.set(ip, { count: 1, startTime: now });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};

module.exports = { authRateLimiter, securityHeaders };
