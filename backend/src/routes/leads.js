'use strict';

const crypto = require('crypto');
const express = require('express');
const { submitLimiter } = require('../middleware/security');
const { leadRules, handleValidation } = require('../validators/leads');
const { saveLead } = require('../services/store');
const { sendLeadNotification } = require('../services/mailer');
const logger = require('../logger');

const router = express.Router();

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';

// POST /api/leads  — "Request a Demo" submissions
router.post('/', submitLimiter, leadRules, handleValidation, async (req, res, next) => {
  try {
    // Honeypot tripped in validator → 200 OK, but do nothing.
    if (req.isSpam) return res.status(200).json({ ok: true });

    const b = req.body;
    const lead = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fullName: b.fullName,
      email: b.email,
      company: b.company,
      role: b.role || '',
      annualSpend: b.annualSpend || '',
      interest: b.interest || '',
      source: b.source || '',
      message: b.message || '',
      ip: clientIp(req),
      userAgent: (req.headers['user-agent'] || '').slice(0, 256),
    };

    await saveLead(lead);
    // Fire-and-forget email; never block / fail the request on mail errors.
    sendLeadNotification(lead).catch((e) => logger.error('notify error:', e.message));

    return res.status(201).json({ ok: true, id: lead.id, message: 'Thanks! Your demo slot is reserved.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
