const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

// 🟢 NEW: Point directly to the physical template folders we created!
const templateDir = path.join(__dirname, '../templates/emails');
const settingsPath = path.join(templateDir, 'smtp_settings.json');
const metadataPath = path.join(templateDir, 'templates_metadata.json');

// Ensure the directory exists
const ensureDataDir = async () => {
    try { await fs.mkdir(templateDir, { recursive: true }); } catch (e) {}
};

// ==========================================
// ⚙️ SETTINGS MANAGEMENT
// ==========================================
exports.getSettings = async (req, res, next) => {
    try {
        await ensureDataDir();
        
        let settings = { 
            provider: process.env.SMTP_PROVIDER || 'brevo', 
            smtpUser: process.env.SMTP_USER || '', 
            smtpPass: process.env.SMTP_PASS || '', 
            fromName: 'HRY Support', 
            fromEmail: process.env.SMTP_USER || 'noreply@homeratesyard.com' 
        };
        
        try {
            const data = await fs.readFile(settingsPath, 'utf8');
            settings = { ...settings, ...JSON.parse(data) };
        } catch (e) { /* Fallback to .env defaults */ }
        
        res.status(200).json(settings);
    } catch (error) { next(error); }
};

exports.updateSettings = async (req, res, next) => {
    try {
        await ensureDataDir();
        const newSettings = req.body;
        await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2));
        res.status(200).json({ success: true, settings: newSettings });
    } catch (error) { next(error); }
};

// ==========================================
// 📝 TEMPLATE MANAGEMENT (Bridged to Filesystem)
// ==========================================
const defaultMetadata = [
    { id: 'welcome', name: 'Welcome & Onboarding', triggerType: 'auth_register', subject: 'Welcome to HomeRatesYard! 🚀', isActive: true },
    { id: 'password_reset', name: 'Password Reset', triggerType: 'auth_password_reset', subject: 'Security Alert: Password Reset Requested 🔐', isActive: true }
];

exports.getTemplates = async (req, res, next) => {
    try {
        await ensureDataDir();
        
        // 1. Load Metadata (Subjects, Status)
        let metadata = defaultMetadata;
        try {
            const data = await fs.readFile(metadataPath, 'utf8');
            metadata = JSON.parse(data);
        } catch (e) {
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        }

        // 2. 🟢 Inject actual HTML bodies from the physical files!
        const templatesWithHtml = await Promise.all(metadata.map(async (meta) => {
            let htmlBody = '';
            try {
                htmlBody = await fs.readFile(path.join(templateDir, `${meta.id}.html`), 'utf8');
            } catch (e) {
                console.warn(`Missing HTML file for ${meta.id}.html`);
            }
            return { ...meta, htmlBody };
        }));

        res.status(200).json(templatesWithHtml);
    } catch (error) { next(error); }
};

exports.updateTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { subject, htmlBody, isActive } = req.body;

        // 1. Update Metadata (Subject Line & Status)
        let metadata = defaultMetadata;
        try {
            const data = await fs.readFile(metadataPath, 'utf8');
            metadata = JSON.parse(data);
        } catch(e) {}

        const index = metadata.findIndex(t => t.id === id);
        if (index !== -1) {
            if (subject) metadata[index].subject = subject;
            if (isActive !== undefined) metadata[index].isActive = isActive;
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        }

        // 2. 🟢 Write the new UI HTML directly back to the filesystem!
        if (htmlBody) {
            await fs.writeFile(path.join(templateDir, `${id}.html`), htmlBody);
        }
        
        res.status(200).json({ success: true, message: 'Template successfully saved to disk.' });
    } catch (error) { next(error); }
};

// ==========================================
// 🚀 REAL SMTP DISPATCHER
// ==========================================
exports.sendTestEmail = async (req, res, next) => {
    try {
        const { testEmail, provider } = req.body;
        if (!testEmail) return res.status(400).json({ success: false, message: 'Test email required.' });

        let config = {
            smtpUser: process.env.SMTP_USER,
            smtpPass: process.env.SMTP_PASS,
            fromName: 'HRY Support',
            fromEmail: process.env.SMTP_USER
        };

        try {
            const data = await fs.readFile(settingsPath, 'utf8');
            config = { ...config, ...JSON.parse(data) };
        } catch (e) {}

        const hosts = {
            'mailjet': 'in-v3.mailjet.com',
            'brevo': 'smtp-relay.brevo.com',
            'sendgrid': 'smtp.sendgrid.net'
        };

        const transporter = nodemailer.createTransport({
            host: hosts[provider] || hosts['brevo'],
            port: 587,
            secure: false, 
            auth: {
                user: config.smtpUser,
                pass: config.smtpPass 
            }
        });

        const info = await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to: testEmail,
            subject: "🟢 System Diagnostic: SMTP Integration Successful",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0A1128;">Connection Established!</h2>
                <p style="color: #475569;">Your HomeRatesYard instance successfully routed this email through <strong>${provider.toUpperCase()}</strong>.</p>
                <br/>
                <p style="font-size: 12px; color: #94a3b8;">Timestamp: ${new Date().toISOString()}</p>
              </div>
            `
        });

        res.status(200).json({ success: true, message: `Dispatched to ${testEmail}!` });
    } catch (error) {
        console.error("SMTP Error:", error);
        res.status(500).json({ success: false, message: `SMTP Failure: Check Credentials.` });
    }
};