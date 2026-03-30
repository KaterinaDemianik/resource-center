const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

/**
 * Форматує об'єкт пагінації
 * @param {number} page - Поточна сторінка
 * @param {number} limit - Ліміт елементів
 * @param {number} total - Загальна кількість
 * @returns {Object} - Об'єкт пагінації
 */
const formatPagination = (page, limit, total) => {
  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

/**
 * Отримує кількість непрочитаних сповіщень користувача
 * @param {string} userId - ID користувача
 * @returns {Promise<number>} - Кількість непрочитаних сповіщень
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ 
    user: userId, 
    isRead: false 
  });
};

/**
 * Перевіряє чи сповіщення належить користувачу
 * @param {string} notificationId - ID сповіщення
 * @param {string} userId - ID користувача
 * @returns {Promise<Object|null>} - Сповіщення або null
 */
const findUserNotification = async (notificationId, userId) => {
  return await Notification.findOne({
    _id: notificationId,
    user: userId
  });
};

/**
 * Отримує сповіщення користувача з пагінацією
 */
router.get('/', auth, async (req, res) => {
  try {
    // Параметри пагінації
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Паралельне отримання даних
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user.userId })
        .populate('relatedResource', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user.userId }),
      getUnreadCount(req.user.userId)
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        ...formatPagination(page, limit, total),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

/**
 * Отримує кількість непрочитаних сповіщень
 */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Позначає сповіщення як прочитане
 */
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await findUserNotification(req.params.id, req.user.userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark all as read
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * Створює нове сповіщення для користувача
 * @param {string} userId - ID користувача
 * @param {string} type - Тип сповіщення
 * @param {string} title - Заголовок сповіщення
 * @param {string} message - Повідомлення сповіщення
 * @param {string|null} relatedResourceId - ID пов'язаного ресурсу
 * @returns {Promise<Object|null>} - Створене сповіщення або null
 */
const createNotification = async (userId, type, title, message, relatedResourceId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      relatedResource: relatedResourceId
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

module.exports = router;
module.exports.createNotification = createNotification;
