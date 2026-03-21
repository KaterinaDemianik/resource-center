const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Resource = require('../models/Resource');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Відправляє відповідь з валідаційними помилками
 * @param {Object} res - Express response об'єкт
 * @param {Array} errors - Масив помилок валідації
 */
const sendValidationErrors = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation errors',
    errors: errors.array()
  });
};

/**
 * Форматує об'єкт пагінації
 * @param {number} page - Поточна сторінка
 * @param {number} limit - Ліміт елементів
 * @param {number} total - Загальна кількість
 * @returns {Object} - Об'єкт пагінації
 */
const formatPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    current: page,
    pages: totalPages,
    total,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Будує MongoDB запит на основі фільтрів
 * @param {Object} queryParams - Параметри запиту
 * @returns {Object} - MongoDB query об'єкт
 */
const buildResourceQuery = (queryParams) => {
  let query = { isActive: true, isApproved: true };
  
  if (queryParams.category) {
    query.category = queryParams.category;
  }
  
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex }
    ];
  }
  
  return query;
};

/**
 * Отримує всі ресурси з пагінацією та фільтрацією
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['education', 'technology', 'health', 'business', 'entertainment', 'other']),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationErrors(res, errors);
    }

    // Параметри пагінації
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    
    // Побудова запиту з фільтрами
    const query = buildResourceQuery(req.query);

    // Отримання ресурсів з пагінацією
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        resources,
        pagination: formatPagination(page, limit, total)
      }
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources'
    });
  }
});

// Get single resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Only show approved and active resources to non-authors
    if (!resource.isActive || !resource.isApproved) {
      // Check if user is the author or admin
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
          if (decoded.userId !== resource.author._id.toString() && decoded.role !== 'admin') {
            return res.status(404).json({
              success: false,
              message: 'Resource not found'
            });
          }
        } catch (err) {
          return res.status(404).json({
            success: false,
            message: 'Resource not found'
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
    }

    // Increment views
    resource.views += 1;
    await resource.save();

    res.json({
      success: true,
      data: resource
    });

  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resource'
    });
  }
});

// Create new resource (authenticated users only)
router.post('/', auth, [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn(['education', 'technology', 'health', 'business', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please enter a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, category, tags, url } = req.body;

    const resource = new Resource({
      title,
      description,
      category,
      tags: tags || [],
      url,
      author: req.user.userId
    });

    await resource.save();
    await resource.populate('author', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully. It will be visible after admin approval.',
      data: resource
    });

  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating resource'
    });
  }
});

// Update resource (author or admin only)
router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['education', 'technology', 'health', 'business', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please enter a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is author or admin
    if (resource.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'category', 'tags', 'url'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    // If content was updated, reset approval status
    if (req.body.title || req.body.description || req.body.url) {
      resource.isApproved = false;
      resource.approvedBy = null;
      resource.approvedAt = null;
    }

    await resource.save();
    await resource.populate('author', 'firstName lastName');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });

  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resource'
    });
  }
});

// Delete resource (author or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is author or admin
    if (resource.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resource'
    });
  }
});

// Get user's own resources
router.get('/user/my-resources', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resources = await Resource.find({ author: req.user.userId })
      .populate('author', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments({ author: req.user.userId });

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user resources'
    });
  }
});

module.exports = router;
