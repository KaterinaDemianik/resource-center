const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Відправляє стандартизовану відповідь про помилку
 * @param {Object} res - Express response об'єкт
 * @param {number} status - HTTP статус код
 * @param {string} message - Повідомлення про помилку
 */
const sendErrorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

/**
 * Витягує JWT токен з Authorization header
 * @param {Object} req - Express request об'єкт
 * @returns {string|null} - JWT токен або null
 */
const extractToken = (req) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  return token || null;
};

/**
 * Middleware для автентифікації користувача
 * @param {Object} req - Express request об'єкт
 * @param {Object} res - Express response об'єкт
 * @param {Function} next - Express next функція
 */
const auth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return sendErrorResponse(res, 401, 'No token provided, authorization denied');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Перевірка чи користувач існує та активний
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendErrorResponse(res, 401, 'Token is no longer valid');
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    sendErrorResponse(res, 401, 'Token is not valid');
  }
};

/**
 * Middleware для перевірки прав адміністратора
 * @param {Object} req - Express request об'єкт
 * @param {Object} res - Express response об'єкт
 * @param {Function} next - Express next функція
 */
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return sendErrorResponse(res, 403, 'Access denied. Admin privileges required.');
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error.message);
    sendErrorResponse(res, 500, 'Server error in authentication');
  }
};

module.exports = { auth, adminAuth };
