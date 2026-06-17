'use strict';

const logger = require('../logger');
const config = require('../config');

function notFound(req, res, next) {
  // Let unknown non-API routes fall through to the SPA/static handler.
  if (!req.path.startsWith('/api/')) return next();
  res.status(404).json({ ok: false, error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) logger.error('Unhandled error:', err.stack || err.message);
  else logger.warn('Request error:', err.message);

  const body = { ok: false, error: status >= 500 ? 'Internal server error' : err.message };
  // Never leak stack traces to clients in production.
  if (!config.isProd && status >= 500) body.detail = err.message;

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
