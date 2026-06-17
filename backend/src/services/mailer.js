'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger');

let transporter = null;

if (config.smtp.host) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  transporter.verify().then(
    () => logger.info('SMTP transport ready'),
    (err) => logger.warn('SMTP verify failed:', err.message)
  );
} else {
  logger.warn('SMTP not configured — lead emails will be skipped (leads still saved).');
}

const esc = (s = '') => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

/** Notify sales of a new lead. Resolves to false (not thrown) if email is off/fails. */
async function sendLeadNotification(lead) {
  if (!transporter || !config.smtp.notifyTo) return false;
  try {
    const rows = [
      ['Name', lead.fullName],
      ['Email', lead.email],
      ['Company', lead.company],
      ['Role', lead.role],
      ['Annual spend', lead.annualSpend],
      ['Interest', lead.interest],
      ['Source', lead.source],
      ['Message', lead.message],
      ['IP', lead.ip],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td style="padding:4px 10px;color:#64748b">${k}</td><td style="padding:4px 10px">${esc(v)}</td></tr>`)
      .join('');

    await transporter.sendMail({
      from: config.smtp.from,
      to: config.smtp.notifyTo,
      replyTo: lead.email,
      subject: `New demo request — ${lead.company}`,
      text: `New demo request from ${lead.fullName} (${lead.email}) at ${lead.company}.`,
      html: `<h2 style="font-family:Inter,Arial,sans-serif">New demo request</h2><table style="font-family:Inter,Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`,
    });
    logger.info('Lead notification emailed for', lead.email);
    return true;
  } catch (err) {
    logger.error('Lead email failed:', err.message);
    return false;
  }
}

module.exports = { sendLeadNotification };
