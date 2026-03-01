const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Initialize App
const app = express();

// =======================
// 🛡️ Security Middleware
// =======================
app.use(helmet()); 

/**
 * 🟢 SMART CORS CONFIGURATION
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000', // Added 127.0.0.1 just in case
  'https://homeratesyard.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isVercel = origin.endsWith('.vercel.app');
    const isAllowed = allowedOrigins.includes(origin) || isVercel;

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS Blocked for origin: ${origin}`);
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

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); 
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 200, // Slightly increased to prevent blocking your own admin dashboards
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api', limiter);

// =======================
// 🛤️ Routes (Mounting)
// =======================

// 🟢 NEW: Explicitly mount the new email routes BEFORE general admin routes
const emailAdminRoutes = require('./routes/email.routes.js');
app.use('/api/admin/emails', emailAdminRoutes);

app.use('/api/auth', require('./routes/auth.routes')); 
app.use('/api/users', require('./routes/user.routes')); 
app.use('/api/loans', require('./routes/loan.routes')); 
app.use('/api/documents', require('./routes/document.routes')); 
app.use('/api/payments', require('./routes/payment.routes')); 
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/admin', require('./routes/admin.routes')); // General admin routes
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));


// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '🚀 HomeRatesYard API Gateway is Active', 
    env: process.env.NODE_ENV,
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
        return res.status(400).json({ success: false, message: err.errors.map(e => e.message) });
    }

    res.status(statusCode).json({ 
      success: false,
      message: message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// Maintenance Mode Middleware
app.use(require('./middleware/maintenanceMode.js'));

module.exports = app;