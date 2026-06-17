'use strict';

const path = require('path');
const express = require('express');
const compression = require('compression');
const hpp = require('hpp');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./logger');
const {
  helmetMiddleware,
  corsMiddleware,
  globalLimiter,
} = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/error');
const leadsRouter = require('./routes/leads');

const app = express();

// Behind a proxy (nginx, Render, Heroku) so rate-limiting sees real client IPs.
if (config.trustProxy) app.set('trust proxy', config.trustProxy);
app.disable('x-powered-by');

// ── Security & hardening ──
app.use(helmetMiddleware());
app.use(corsMiddleware());
app.use(globalLimiter);

// ── Parsing (tight body limits to blunt payload abuse) ──
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use(hpp()); // strip duplicated query/body params

// ── Logging ──
app.use(morgan(config.isProd ? 'combined' : 'dev'));

// ── Compression ──
app.use(compression());

// ── API ──
app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use('/api/leads', leadsRouter);

// ── Static frontend (served with sane caching) ──
app.use(
  express.static(config.frontendDir, {
    extensions: ['html'],
    maxAge: config.isProd ? '7d' : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    },
  })
);

// Default document
app.get('/', (req, res) => res.sendFile(path.join(config.frontendDir, 'index.html')));

// ── Errors ──
app.use(notFound);
app.use(errorHandler);

logger.info('Serving frontend from', config.frontendDir);

module.exports = app;
