'use strict';

const path = require('path');
require('dotenv').config();

const bool = (v, def = false) =>
  v === undefined ? def : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());

const int = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

const list = (v) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const config = {
  env: NODE_ENV,
  isProd,
  port: int(process.env.PORT, 5000),
  trustProxy: int(process.env.TRUST_PROXY, 0),

  // Static site directory (absolute path resolved from backend/)
  frontendDir: path.resolve(__dirname, '..', process.env.FRONTEND_DIR || '../frontend'),

  corsOrigins: list(process.env.CORS_ORIGINS),

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: int(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'CloudPi <no-reply@cloudpi.ai>',
    notifyTo: process.env.LEADS_NOTIFY_TO || '',
  },

  dataDir: path.resolve(__dirname, '..', 'data'),
};

// Fail fast on obviously-insecure production config.
if (isProd && config.corsOrigins.length === 0) {
  // eslint-disable-next-line no-console
  console.warn('[config] WARNING: NODE_ENV=production but CORS_ORIGINS is empty.');
}

module.exports = config;
