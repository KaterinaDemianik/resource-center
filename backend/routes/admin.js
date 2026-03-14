const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Get all resources for admin (including pending approval)
router.get('/resources', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['all', 'pending', 'approved', 'inactive']).withMessage('Invalid status filter')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on status filter
    let query = {};
    switch (req.query.status) {
      case 'pending':
        query = { isApproved: false, rejectedAt: null };
        break;
      case 'approved':
        query = { isApproved: true, isActive: true };
        break;
      case 'inactive':
        query = { isActive: false, isApproved: true };
        break;
      case 'rejected':
        query = { rejectedAt: { $ne: null } };
        break;
      default:
        // 'all' or no filter - show everything
        break;
    }

    const resources = await Resource.find(query)
      .populate('author', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments(query);

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
    console.error('Admin get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources'
    });
  }
});

// Approve resource
router.patch('/resources/:id/approve', adminAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.isApproved = true;
    resource.isActive = true;
    resource.approvedBy = req.user.userId;
    resource.approvedAt = new Date();
    resource.rejectedAt = null;
    await resource.save();

    await resource.populate(['author', 'approvedBy']);

    // Створюємо сповіщення для автора ресурсу
    await createNotification(
      resource.author._id,
      'resource_approved',
      'Ресурс схвалено',
      `Ваш ресурс "${resource.title}" був схвалений модератором і тепер доступний для всіх користувачів.`,
      resource._id
    );

    res.json({
      success: true,
      message: 'Resource approved successfully',
      data: resource
    });

  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving resource'
    });
  }
});

// Reject/Unapprove resource
router.patch('/resources/:id/reject', adminAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.isApproved = false;
    resource.isActive = false;
    resource.approvedBy = null;
    resource.approvedAt = null;
    resource.rejectedAt = new Date();
    await resource.save();

    await resource.populate('author');

    // Створюємо сповіщення для автора ресурсу
    await createNotification(
      resource.author._id,
      'resource_rejected',
      'Ресурс відхилено',
      `Ваш ресурс "${resource.title}" був відхилений модератором. Будь ласка, перевірте відповідність правилам та спробуйте знову.`,
      resource._id
    );

    res.json({
      success: true,
      message: 'Resource approval revoked successfully',
      data: resource
    });

  } catch (error) {
    console.error('Reject resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting resource'
    });
  }
});

// Activate/Deactivate resource
router.patch('/resources/:id/toggle-active', adminAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const wasActive = resource.isActive;
    resource.isActive = !resource.isActive;
    await resource.save();

    await resource.populate(['author', 'approvedBy']);

    // Створюємо сповіщення для автора якщо ресурс деактивовано
    if (wasActive && !resource.isActive) {
      await createNotification(
        resource.author._id,
        'resource_deactivated',
        'Ресурс деактивовано',
        `Ваш ресурс "${resource.title}" був деактивований адміністратором.`,
        resource._id
      );
    }

    res.json({
      success: true,
      message: `Resource ${resource.isActive ? 'activated' : 'deactivated'} successfully`,
      data: resource
    });

  } catch (error) {
    console.error('Toggle resource active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resource status'
    });
  }
});

// Get all users
router.get('/users', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['all', 'active', 'inactive', 'unverified']).withMessage('Invalid status filter')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query based on status filter
    let query = {};
    switch (req.query.status) {
      case 'active':
        query = { isActive: true, emailVerified: true };
        break;
      case 'inactive':
        query = { isActive: false };
        break;
      case 'unverified':
        query = { emailVerified: false };
        break;
      default:
        // 'all' or no filter - show everyone
        break;
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// Activate/Deactivate user
router.patch('/users/:id/toggle-active', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      unverifiedUsers,
      totalResources,
      approvedResources,
      pendingResources,
      inactiveResources
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, emailVerified: true }),
      User.countDocuments({ emailVerified: false }),
      Resource.countDocuments(),
      Resource.countDocuments({ isApproved: true, isActive: true }),
      Resource.countDocuments({ isApproved: false, rejectedAt: null }),
      Resource.countDocuments({ isActive: false, isApproved: true })
    ]);

    // Get recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [recentUsers, recentResources] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Resource.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          unverified: unverifiedUsers,
          recentlyRegistered: recentUsers
        },
        resources: {
          total: totalResources,
          approved: approvedResources,
          pending: pendingResources,
          inactive: inactiveResources,
          recentlyCreated: recentResources
        }
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
