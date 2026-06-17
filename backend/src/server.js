'use strict';

const app = require('./app');
const config = require('./config');
const logger = require('./logger');

const server = app.listen(config.port, () => {
  logger.info(`CloudPi backend listening on http://localhost:${config.port}  (${config.env})`);
});

// ── Graceful shutdown ──
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
  // Force-exit if connections hang.
  setTimeout(() => process.exit(1), 10000).unref();
};

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err.stack || err.message);
  process.exit(1);
});
