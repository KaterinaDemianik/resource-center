const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Валідація email з кращим regex
 */
const emailValidationRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Схема користувача з валідацією та методами
 */
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'First name cannot be empty'
    }
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Last name cannot be empty'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [emailValidationRegex, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

/**
 * Middleware для хешування паролю перед збереженням
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Порівнює кандидат-пароль з хешованим паролем
 * @param {string} candidatePassword - Пароль для перевірки
 * @returns {Promise<boolean>} - Результат порівняння
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Конвертує користувача в JSON без чутливих даних
 * @returns {Object} - Об'єкт користувача без паролю та токенів
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  // Видаляємо чутливі поля
  const sensitiveFields = [
    'password',
    'emailVerificationToken', 
    'resetPasswordToken', 
    'resetPasswordExpires'
  ];
  
  sensitiveFields.forEach(field => delete userObject[field]);
  
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
