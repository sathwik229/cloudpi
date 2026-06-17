'use strict';

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../logger');

/**
 * Content-Security-Policy tuned for this static template's external resources:
 *  - Google Fonts (styles + font files)
 *  - GSAP from cdnjs (scripts)
 *  - brand logos from cdn.simpleicons.org + cdn.jsdelivr.net (images)
 *  - Google Maps iframe (some inner pages)
 *
 * NOTE: 'unsafe-inline' is enabled for scripts/styles because the template uses
 * inline style attributes and SVG. For maximum hardening, move to nonce/hash-based
 * CSP and drop 'unsafe-inline'.
 */
const contentSecurityPolicy = {
  useDefaults: true,
  directives: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'self'"],
    formAction: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'https://cdn.simpleicons.org', 'https://cdn.jsdelivr.net'],
    connectSrc: ["'self'"],
    frameSrc: ['https://maps.google.com', 'https://www.google.com'],
    upgradeInsecureRequests: config.isProd ? [] : null,
  },
};

function helmetMiddleware() {
  return helmet({
    contentSecurityPolicy,
    crossOriginEmbedderPolicy: false, // allow cross-origin CDN images
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  });
}

function corsMiddleware() {
  // No allow-list configured → same-origin only (safest default; the backend
  // serves the site, so the form is same-origin and needs no CORS).
  if (config.corsOrigins.length === 0) {
    return cors({ origin: false });
  }
  return cors({
    origin(origin, cb) {
      // Allow same-origin / curl / server-to-server (no Origin header).
      if (!origin) return cb(null, true);
      if (config.corsOrigins.includes(origin)) return cb(null, true);
      logger.warn('CORS blocked origin:', origin);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 600,
  });
}

// Global limiter: blanket protection against abuse.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, please try again later.' },
});

// Strict limiter for write endpoints (lead/contact submissions).
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many submissions. Please try again in a few minutes.' },
});

module.exports = { helmetMiddleware, corsMiddleware, globalLimiter, submitLimiter };
