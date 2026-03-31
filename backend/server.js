require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/database');

/**
 * Конфігурація сервера
 */
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Connect to database
connectDB();

const app = express();

/** Keys whose values must not be HTML-stripped (passwords, tokens) */
const XSS_SKIP_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'emailVerificationToken',
  'resetPasswordToken'
]);

/**
 * Recursively strip HTML-like tags from string fields to reduce stored/reflected XSS risk.
 * Skips password and token fields.
 */
const sanitizeBodyForXss = (value, keyHint) => {
  if (keyHint && XSS_SKIP_KEYS.has(keyHint)) {
    return value;
  }
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeBodyForXss(v));
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeBodyForXss(v, k);
    }
    return out;
  }
  return value;
};

const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' }
});

/**
 * Налаштування middleware
 */
const configureMiddleware = () => {
  const isProd = NODE_ENV === 'production';

  // Security headers — stricter CSP in production (GraphiQL needs relaxations in dev only)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: isProd
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"]
          }
        }
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:']
          }
        }
  }));

  // CORS configuration
  app.use(cors({
    origin: CLIENT_URL,
    credentials: true
  }));

  // Logging
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Rate limiting for auth endpoints (login/register brute-force mitigation)
  app.use('/api/auth/login', authRouteLimiter);
  app.use('/api/auth/register', authRouteLimiter);

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // NoSQL injection mitigation + XSS string cleanup on JSON bodies
  app.use(mongoSanitize({ replaceWith: '_' }));
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeBodyForXss(req.body);
    }
    next();
  });
};

// Статична папка для завантажених файлів
app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

/**
 * Налаштування роутів
 */
const configureRoutes = () => {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV
    });
  });

  // API routes (JWT-only; no server session store)
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/resources', require('./routes/resources'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/graphql', require('./graphql'));
};

/**
 * Глобальний обробник помилок
 */
const configureErrorHandling = () => {
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Something went wrong!',
      error: NODE_ENV === 'production' ? {} : {
        message: err.message,
        stack: err.stack
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });
};

/**
 * Запуск сервера
 */
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Client URL: ${CLIENT_URL}`);
    console.log(`MongoDB: ${process.env.MONGODB_URI ? 'Remote' : 'localhost'}`);
  });
};

// Ініціалізація сервера
configureMiddleware();
configureRoutes();
configureErrorHandling();
startServer();

module.exports = app;
