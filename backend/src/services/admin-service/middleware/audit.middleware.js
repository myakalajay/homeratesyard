const db = require('../../../models'); // Central DB Entry

/**
 * 👁️ Forensic Audit Middleware
 * Captures the "Who, What, Where" of every Admin Action.
 */
exports.auditLogger = (actionType) => {
    return (req, res, next) => {
        // We hook into the 'finish' event of the response to log AFTER success
        // Or we can log immediately. For security, immediate logging of *attempt* is often better.
        
        // Asynchronous Logging (Fire-and-Forget pattern for performance)
        const performLog = async () => {
            try {
                if (!req.user || !req.user.id) return; // Should be caught by RBAC

                const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                
                await db.AuditLog.create({
                    adminId: req.user.id,
                    action: actionType,
                    resource: req.originalUrl, // e.g., /api/admin/users/123
                    method: req.method,
                    ipAddress: ip,
                    details: JSON.stringify({
                        body: req.method !== 'GET' ? req.body : null, // ⚠️ Sanitize passwords in real prod
                        query: req.query,
                        userAgent: req.headers['user-agent']
                    })
                });
            } catch (err) {
                console.error("[AUDIT FAILURE] Could not write to Ledger:", err.message);
                // We do NOT block the request if logging fails, but we shout about it in console
            }
        };

        performLog();
        next();
    };
};