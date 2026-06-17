'use strict';

const { body, validationResult } = require('express-validator');

const ROLES = ['Engineering', 'FinOps', 'Finance', 'Leadership', 'Other'];

// Validation + sanitization chain for the "Request a Demo" lead form.
const leadRules = [
  // Honeypot: real users never fill this. Bots usually do.
  body('website').optional({ checkFalsy: false }).isLength({ max: 0 }).withMessage('spam'),

  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name is required.').escape(),

  body('email')
    .trim()
    .isEmail().withMessage('A valid work email is required.')
    .normalizeEmail()
    .isLength({ max: 160 }),

  body('company').trim().isLength({ min: 1, max: 120 }).withMessage('Company is required.').escape(),

  body('role').optional({ checkFalsy: true }).trim().isIn(ROLES).withMessage('Invalid role.'),

  body('annualSpend').optional({ checkFalsy: true }).trim().isLength({ max: 60 }).escape(),
  body('interest').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).escape(),
  body('source').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).escape(),

  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).escape(),
];

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  // Honeypot tripped → pretend success, drop silently (don't tip off bots).
  if (result.array().some((e) => e.msg === 'spam')) {
    req.isSpam = true;
    return next();
  }

  const errors = {};
  for (const e of result.array()) {
    if (!errors[e.path]) errors[e.path] = e.msg;
  }
  return res.status(422).json({ ok: false, error: 'Please check the form.', fields: errors });
}

module.exports = { leadRules, handleValidation, ROLES };
