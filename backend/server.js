const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');
require('dotenv').config();

/**
 * Конфігурація сервера
 */
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Connect to database
connectDB();

const app = express();

/**
 * Налаштування middleware
 */
const configureMiddleware = () => {
  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Дозволити inline scripts та eval для GraphiQL
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
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

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
};

// Статична папка для завантажених файлів
app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

/**
 * Налаштування сесій
 */
const configureSession = () => {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'resource-center-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center'
    }),
    cookie: {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
};

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

  // API routes
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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`🔗 Client URL: ${CLIENT_URL}`);
    console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Remote' : 'localhost'}`);
  });
};

// Ініціалізація сервера
configureMiddleware();
configureSession();
configureRoutes();
configureErrorHandling();
startServer();

module.exports = app;
