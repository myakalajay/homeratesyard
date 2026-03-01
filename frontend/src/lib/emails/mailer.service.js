import nodemailer from 'nodemailer';
import { compileTemplate } from './template.compiler.js';
import { TEMPLATES } from './templates/loan.templates.js';

class MailerService {
  constructor() {
    // 🟢 SECURE MAILJET SMTP CONFIGURATION
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'in-v3.mailjet.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER, // Mailjet API Key
        pass: process.env.SMTP_PASS  // Mailjet Secret Key
      },
      // Mailjet highly recommends these pooling settings for performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    // 🔴 CRITICAL: This MUST match the Sender Email you verified in Mailjet
    this.defaultFrom = process.env.SMTP_DEFAULT_FROM || `"HomeRatesYard" <noreply@homeratesyard.com>`;
  }

  /**
   * Core sending function using native templates + Mailjet Delivery.
   */
  async sendTransactionalEmail(toEmail, triggerType, payload) {
    try {
      // 1. Locate the Native Template
      let templateKey = Object.keys(TEMPLATES).find(k => TEMPLATES[k].trigger === triggerType);
      let templateRecord = TEMPLATES[templateKey];

      if (!templateRecord) {
        throw new Error(`Template for trigger [${triggerType}] not found.`);
      }

      // 2. Native Compilation (Injects {{variables}})
      const compiledSubject = compileTemplate(templateRecord.subject, payload);
      const compiledHtml = compileTemplate(templateRecord.html, payload);

      // 3. Hand off to Mailjet SMTP
      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: toEmail,
        subject: compiledSubject,
        html: compiledHtml,
        // Optional: Mailjet specific tracking headers
        headers: {
          'X-Mailjet-TrackOpen': '1',
          'X-Mailjet-TrackClick': '1'
        }
      });

      console.log(`✅ Mailjet Delivered to ${toEmail} [Message ID: ${info.messageId}]`);
      return { success: true, messageId: info.messageId, provider: 'mailjet' };

    } catch (error) {
      console.error(`❌ Mailjet Transmission Error:`, error.message);
      throw error;
    }
  }
}

export const mailerEngine = new MailerService();