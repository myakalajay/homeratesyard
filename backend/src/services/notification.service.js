const { Notification, User } = require('../models');

/**
 * @class NotificationService
 * @desc Centralized dispatch for system alerts (DB, Email, SMS)
 */
class NotificationService {
  
  /**
   * Send a notification to a user
   * @param {number} userId - Target User ID
   * @param {string} title - Short header
   * @param {string} message - Detailed body
   * @param {string} type - 'info', 'success', 'warning', 'error'
   * @param {string|null} link - Action URL (e.g., '/dashboard/loans/123')
   * @param {object} options - { sendEmail: boolean, sendSms: boolean }
   */
  static async send(userId, title, message, type = 'info', link = null, options = {}) {
    try {
      // 1. Database Notification (In-App)
      // specific await to ensure UI consistency, or remove await for fire-and-forget
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        actionLink: link,
        isRead: false
      });

      console.log(`[NOTIFY] In-App sent to User ${userId}: ${title}`);

      // 2. Email Notification (Future Integration)
      if (options.sendEmail) {
        await this.sendEmail(userId, title, message);
      }

      // 3. SMS Notification (Future Integration)
      if (options.sendSms) {
        await this.sendSms(userId, message);
      }

      return notification;

    } catch (error) {
      // Fail gracefully - do not crash the main application flow
      console.error(`[NOTIFY ERROR] Failed to send to User ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * 📧 Placeholder for SendGrid / AWS SES
   */
  static async sendEmail(userId, subject, body) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.email) return;

      // TODO: Integrate SendGrid Here
      // await sendgrid.send({ to: user.email, subject, text: body });
      console.log(`[EMAIL] (Mock) Sent to ${user.email}: ${subject}`);
    } catch (err) {
      console.error("[EMAIL ERROR]", err.message);
    }
  }

  /**
   * 📱 Placeholder for Twilio
   */
  static async sendSms(userId, text) {
    try {
        // TODO: Integrate Twilio Here
        console.log(`[SMS] (Mock) Sent to User ${userId}: ${text}`);
    } catch (err) {
        console.error("[SMS ERROR]", err.message);
    }
  }
}

// Export as a singleton or static class
module.exports = {
    sendNotification: NotificationService.send.bind(NotificationService)
};