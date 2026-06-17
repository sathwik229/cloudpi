'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../logger');

const LEADS_FILE = path.join(config.dataDir, 'leads.jsonl');

function ensureDir() {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
}

/**
 * Append a lead as one JSON object per line (JSONL). Simple, append-only,
 * durable. Swap for Postgres/Mongo by replacing this module.
 */
async function saveLead(lead) {
  ensureDir();
  const line = JSON.stringify(lead) + '\n';
  await fs.promises.appendFile(LEADS_FILE, line, 'utf8');
  logger.info('Lead saved:', lead.id, lead.email);
  return lead;
}

module.exports = { saveLead, LEADS_FILE };
