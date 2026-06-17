'use strict';

// Tiny structured logger (no extra dependency). Swap for pino/winston in prod.
const ts = () => new Date().toISOString();

const write = (level, args) => {
  const line = [`[${ts()}]`, `[${level}]`, ...args];
  if (level === 'ERROR') console.error(...line);
  else if (level === 'WARN') console.warn(...line);
  else console.log(...line);
};

module.exports = {
  info: (...a) => write('INFO', a),
  warn: (...a) => write('WARN', a),
  error: (...a) => write('ERROR', a),
};
