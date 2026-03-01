const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * Universal Email Dispatcher
 * @param {string} templateName - The name of the HTML file (without .html)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {object} variables - Key-value pairs to inject into the template (e.g., { user_name: 'John' })
 */
const sendMail = async (templateName, to, subject, variables = {}) => {
    try {
        // 1. Fetch SMTP configuration 
        // 🟢 BUG FIX: Pointing to the actual persistent templates folder, not the OS temp dir!
        const templateDir = path.join(__dirname, '../templates/emails');
        const settingsPath = path.join(templateDir, 'smtp_settings.json');
        
        let config = {
            provider: process.env.SMTP_PROVIDER || 'brevo',
            smtpUser: process.env.SMTP_USER,
            smtpPass: process.env.SMTP_PASS,
            fromName: 'HomeRatesYard',
            fromEmail: process.env.SMTP_USER
        };

        try {
            const data = await fs.readFile(settingsPath, 'utf8');
            config = { ...config, ...JSON.parse(data) };
        } catch (e) { /* use .env defaults */ }

        // 2. Read Templates from Filesystem
        const templatePath = path.join(templateDir, `${templateName}.html`);
        const basePath = path.join(templateDir, `base.html`);

        let innerContent = await fs.readFile(templatePath, 'utf8');
        let fullHtml = await fs.readFile(basePath, 'utf8');

        // 3. Inject Specific Variables into Inner Content (e.g., user_name, action_url)
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            innerContent = innerContent.replace(regex, value);
        }

        // 4. Inject Inner Content into the Base Layout
        fullHtml = fullHtml.replace('{{content}}', innerContent);

        // 5. 🟢 NEW: Inject Global Variables (Applies to base.html footprint)
        const globalVariables = {
            current_year: new Date().getFullYear(),
            preheader: variables.preheader || subject || "Important update from HomeRatesYard"
        };

        for (const [key, value] of Object.entries(globalVariables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            fullHtml = fullHtml.replace(regex, value);
        }

        // 6. Configure Nodemailer
        const hosts = {
            'mailjet': 'in-v3.mailjet.com',
            'brevo': 'smtp-relay.brevo.com',
            'sendgrid': 'smtp.sendgrid.net'
        };

        const transporter = nodemailer.createTransport({
            host: hosts[config.provider] || hosts['brevo'],
            port: 587,
            secure: false,
            auth: {
                user: config.smtpUser,
                pass: config.smtpPass
            }
        });

        // 7. Dispatch!
        const info = await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to,
            subject,
            html: fullHtml
        });

        console.log(`✉️ [SMTP] Dispatched '${templateName}' to ${to} (ID: ${info.messageId})`);
        return true;

    } catch (error) {
        console.error(`❌ [SMTP Error] Failed to send '${templateName}':`, error.message);
        throw error; // Throwing allows the calling function to handle the failure
    }
};

module.exports = sendMail;