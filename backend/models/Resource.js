const mongoose = require('mongoose');

/**
 * Валідація URL з кращим regex
 */
const urlValidationRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Дозволені категорії ресурсів
 */
const VALID_CATEGORIES = ['education', 'technology', 'health', 'business', 'entertainment', 'other'];

/**
 * Схема ресурсу з валідацією та індексами
 */
const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Title cannot be empty'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length >= 2;
      },
      message: 'Description must be at least 2 characters long'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: VALID_CATEGORIES,
      message: 'Category must be one of: ' + VALID_CATEGORIES.join(', ')
    },
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Tag cannot be empty'
    }
  }],
  url: {
    type: String,
    trim: true,
    required: [true, 'URL is required'],
    match: [urlValidationRegex, 'Please enter a valid URL starting with http:// or https://']
  },
  urls: [{
    type: String,
    trim: true,
    match: [urlValidationRegex, 'Please enter a valid URL starting with http:// or https://']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Індекси для оптимізації запитів
 */
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Пошук по тексту
resourceSchema.index({ category: 1, isActive: 1, isApproved: 1 }); // Фільтрація по категорії та статусу
resourceSchema.index({ author: 1, createdAt: -1 }); // Ресурси користувача
resourceSchema.index({ createdAt: -1 }); // Сортування по даті

/**
 * Віртуальне поле для середнього рейтингу
 */
resourceSchema.virtual('averageRating').get(function() {
  if (this.ratingCount === 0) return '0.0';
  return (this.rating / this.ratingCount).toFixed(1);
});

/**
 * Віртуальне поле для статусу модерації
 */
resourceSchema.virtual('moderationStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.isApproved) {
    return this.rejectedAt ? 'rejected' : 'pending';
  }
  return 'approved';
});

/**
 * Включає віртуальні поля в JSON
 */
resourceSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Resource', resourceSchema);
