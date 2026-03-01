const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Initialize App
const app = express();

// =======================
// 🛡️ Security Middleware
// =======================
app.use(helmet()); 

/**
 * 🟢 STRICT PRODUCTION CORS CONFIGURATION
 * Localhost removed. Only accepts traffic from Vercel & verified origins.
 */
const allowedOrigins = [
  'https://homeratesyard.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or mobile apps)
    if (!origin) return callback(null, true);
    
    // Safely strip trailing slashes if they exist
    const cleanOrigin = origin.replace(/\/$/, "");
    
    // Allow wildcard subdomains from Vercel deployments
    const isVercel = cleanOrigin.endsWith('.vercel.app');
    const isAllowed = allowedOrigins.includes(cleanOrigin) || isVercel;

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 [Security] CORS Blocked unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
})); 

// 🚀 RENDER PROXY FIX: Safest configuration for rate-limiting behind load balancers
app.set('trust proxy', 1);

app.use(hpp()); 
app.use(compression()); 

// =======================
// ⚙️ Standard Middleware
// =======================
app.use(express.json({ limit: '50kb' })); 
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// 🟢 FIX: Dynamic Production Logging for Render
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('common')); // Logs real IPs and standard web traffic
} else {
  app.use(morgan('dev')); 
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Rate Limiting (Prevents DDoS attacks during your demo)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 200, 
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api', limiter);

// ==========================================
// 🚧 SYSTEM INTERCEPTORS (Must go before routes)
// ==========================================
try {
  const maintenanceMode = require('./middleware/maintenanceMode.js');
  app.use(maintenanceMode);
} catch (e) {
  console.warn('⚠️ [Maintenance] Middleware not found. System will bypass maintenance checks.');
}

// =======================
// 🛤️ Routes (Mounting)
// =======================

app.use('/api/auth', require('./routes/auth.routes')); 
app.use('/api/users', require('./routes/user.routes')); 
app.use('/api/loans', require('./routes/loan.routes')); 
app.use('/api/documents', require('./routes/document.routes')); 
app.use('/api/payments', require('./routes/payment.routes')); 
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/admin', require('./routes/admin.routes')); 
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));

// 🟢 CRITICAL FIX: The new Borrower Dashboard endpoints!
try {
    app.use('/api/borrower', require('./routes/borrower.routes'));
} catch (e) {
    console.warn('⚠️ [Routes] Borrower routes not found yet. Skipping mount.');
}


// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '🚀 HomeRatesYard API Gateway is Active', 
    env: process.env.NODE_ENV || 'production',
    timestamp: new Date() 
  });
});

// 🛑 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: `Can't find ${req.originalUrl} on this server!` 
  });
});

// 🔥 Global Error Handler
app.use((err, req, res, next) => {
    // Catch malformed JSON payloads from the frontend
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload format.' });
    }

    console.error(`🔥 Error: ${err.message}`);
    const statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ success: false, message: 'Duplicate field value entered.' });
    }

    if (err.name === 'SequelizeValidationError') {
        // Maps array of errors to a single comma-separated string to prevent Frontend UI crashes
        const cleanMessage = err.errors.map(e => e.message).join(', ');
        return res.status(400).json({ success: false, message: cleanMessage });
    }

    res.status(statusCode).json({ 
      success: false,
      message: message,
      // Hide stack trace in production to prevent leaking server details
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

module.exports = app;