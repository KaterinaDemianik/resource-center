const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { sendVerificationEmail } = require('../utils/email');

// Helper function to check authentication
const checkAuth = (context) => {
  if (!context.user) {
    throw new Error('Не авторизовано. Будь ласка, увійдіть в систему.');
  }
  return context.user;
};

// Helper function to check admin role
const checkAdmin = (context) => {
  const user = checkAuth(context);
  if (user.role !== 'admin') {
    throw new Error('Доступ заборонено. Потрібні права адміністратора.');
  }
  return user;
};

const resolvers = {
  // Queries
  resources: async ({ filter }) => {
    try {
      const page = filter?.page || 1;
      const limit = Math.min(filter?.limit || 10, 50);
      const skip = (page - 1) * limit;

      let query = { isActive: true, isApproved: true };

      if (filter?.category) {
        query.category = filter.category;
      }

      if (filter?.search) {
        query.$text = { $search: filter.search };
      }

      const resources = await Resource.find(query)
        .populate('author', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Resource.countDocuments(query);

      return {
        success: true,
        resources,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('GraphQL resources error:', error);
      return { success: false, resources: [], total: 0 };
    }
  },

  resource: async ({ id }) => {
    try {
      const resource = await Resource.findById(id)
        .populate('author', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName');

      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      // Increment views
      resource.views += 1;
      await resource.save();

      return { success: true, resource };
    } catch (error) {
      console.error('GraphQL resource error:', error);
      return { success: false, message: 'Помилка завантаження ресурсу' };
    }
  },

  me: async (args, context) => {
    try {
      const user = checkAuth(context);
      return await User.findById(user.userId);
    } catch (error) {
      return null;
    }
  },

  myResources: async ({ page = 1, limit = 10 }, context) => {
    try {
      const user = checkAuth(context);
      const skip = (page - 1) * limit;

      const resources = await Resource.find({ author: user.userId })
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Resource.countDocuments({ author: user.userId });

      return {
        success: true,
        resources,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('GraphQL myResources error:', error);
      return { success: false, resources: [], total: 0 };
    }
  },

  adminResources: async ({ status, page = 1, limit = 10 }, context) => {
    try {
      checkAdmin(context);
      const skip = (page - 1) * limit;

      let query = {};
      switch (status) {
        case 'pending':
          query = { isApproved: false, isActive: true };
          break;
        case 'approved':
          query = { isApproved: true, isActive: true };
          break;
        case 'inactive':
          query = { isActive: false };
          break;
      }

      const resources = await Resource.find(query)
        .populate('author', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Resource.countDocuments(query);

      return {
        success: true,
        resources,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('GraphQL adminResources error:', error);
      return { success: false, resources: [], total: 0 };
    }
  },

  adminUsers: async ({ status, page = 1, limit = 10 }, context) => {
    try {
      checkAdmin(context);
      const skip = (page - 1) * limit;

      let query = {};
      switch (status) {
        case 'active':
          query = { isActive: true, emailVerified: true };
          break;
        case 'inactive':
          query = { isActive: false };
          break;
        case 'unverified':
          query = { emailVerified: false };
          break;
      }

      const users = await User.find(query)
        .select('-password -emailVerificationToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return { success: true, users, total };
    } catch (error) {
      console.error('GraphQL adminUsers error:', error);
      return { success: false, users: [], total: 0 };
    }
  },

  adminStats: async (args, context) => {
    try {
      checkAdmin(context);

      const [totalUsers, activeUsers, totalResources, approvedResources, pendingResources] = 
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ isActive: true, emailVerified: true }),
          Resource.countDocuments(),
          Resource.countDocuments({ isApproved: true, isActive: true }),
          Resource.countDocuments({ isApproved: false, isActive: true })
        ]);

      return {
        success: true,
        totalUsers,
        activeUsers,
        totalResources,
        approvedResources,
        pendingResources
      };
    } catch (error) {
      console.error('GraphQL adminStats error:', error);
      return { success: false };
    }
  },

  // Mutations
  register: async ({ input }) => {
    try {
      const { firstName, lastName, email, password } = input;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { success: false, message: 'Користувач з таким email вже існує' };
      }

      // Generate verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        emailVerificationToken
      });

      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }

      return {
        success: true,
        message: 'Реєстрація успішна. Перевірте email для підтвердження.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('GraphQL register error:', error);
      return { success: false, message: 'Помилка реєстрації' };
    }
  },

  login: async ({ input }) => {
    try {
      const { email, password } = input;

      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'Невірні облікові дані' };
      }

      if (!user.emailVerified) {
        return { success: false, message: 'Підтвердіть email перед входом' };
      }

      if (!user.isActive) {
        return { success: false, message: 'Акаунт деактивовано' };
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return { success: false, message: 'Невірні облікові дані' };
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        success: true,
        message: 'Вхід успішний',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('GraphQL login error:', error);
      return { success: false, message: 'Помилка входу' };
    }
  },

  logout: async () => {
    return { success: true, message: 'Вихід успішний' };
  },

  verifyEmail: async ({ token }) => {
    try {
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        return { success: false, message: 'Невірний токен підтвердження' };
      }

      user.emailVerified = true;
      user.isActive = true;
      user.emailVerificationToken = null;
      await user.save();

      return { success: true, message: 'Email підтверджено успішно' };
    } catch (error) {
      console.error('GraphQL verifyEmail error:', error);
      return { success: false, message: 'Помилка підтвердження email' };
    }
  },

  createResource: async ({ input }, context) => {
    try {
      const user = checkAuth(context);

      const resource = new Resource({
        ...input,
        author: user.userId
      });

      await resource.save();
      await resource.populate('author', 'firstName lastName');

      return {
        success: true,
        message: 'Ресурс створено. Очікує модерації.',
        resource
      };
    } catch (error) {
      console.error('GraphQL createResource error:', error);
      return { success: false, message: 'Помилка створення ресурсу' };
    }
  },

  updateResource: async ({ id, input }, context) => {
    try {
      const user = checkAuth(context);

      const resource = await Resource.findById(id);
      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      // Check ownership or admin
      if (resource.author.toString() !== user.userId && user.role !== 'admin') {
        return { success: false, message: 'Немає прав на редагування' };
      }

      // Update fields
      Object.keys(input).forEach(key => {
        if (input[key] !== undefined) {
          resource[key] = input[key];
        }
      });

      // Reset approval if content changed
      if (input.title || input.description || input.url) {
        resource.isApproved = false;
        resource.approvedBy = null;
        resource.approvedAt = null;
      }

      await resource.save();
      await resource.populate('author', 'firstName lastName');

      return { success: true, message: 'Ресурс оновлено', resource };
    } catch (error) {
      console.error('GraphQL updateResource error:', error);
      return { success: false, message: 'Помилка оновлення ресурсу' };
    }
  },

  deleteResource: async ({ id }, context) => {
    try {
      const user = checkAuth(context);

      const resource = await Resource.findById(id);
      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      if (resource.author.toString() !== user.userId && user.role !== 'admin') {
        return { success: false, message: 'Немає прав на видалення' };
      }

      await Resource.findByIdAndDelete(id);

      return { success: true, message: 'Ресурс видалено' };
    } catch (error) {
      console.error('GraphQL deleteResource error:', error);
      return { success: false, message: 'Помилка видалення ресурсу' };
    }
  },

  approveResource: async ({ id }, context) => {
    try {
      const user = checkAdmin(context);

      const resource = await Resource.findById(id);
      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      resource.isApproved = true;
      resource.approvedBy = user.userId;
      resource.approvedAt = new Date();
      await resource.save();

      await resource.populate(['author', 'approvedBy']);

      return { success: true, message: 'Ресурс схвалено', resource };
    } catch (error) {
      console.error('GraphQL approveResource error:', error);
      return { success: false, message: 'Помилка схвалення ресурсу' };
    }
  },

  rejectResource: async ({ id }, context) => {
    try {
      checkAdmin(context);

      const resource = await Resource.findById(id);
      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      resource.isApproved = false;
      resource.approvedBy = null;
      resource.approvedAt = null;
      await resource.save();

      await resource.populate('author');

      return { success: true, message: 'Схвалення відхилено', resource };
    } catch (error) {
      console.error('GraphQL rejectResource error:', error);
      return { success: false, message: 'Помилка відхилення ресурсу' };
    }
  },

  toggleResourceActive: async ({ id }, context) => {
    try {
      checkAdmin(context);

      const resource = await Resource.findById(id);
      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      resource.isActive = !resource.isActive;
      await resource.save();

      await resource.populate(['author', 'approvedBy']);

      return {
        success: true,
        message: `Ресурс ${resource.isActive ? 'активовано' : 'деактивовано'}`,
        resource
      };
    } catch (error) {
      console.error('GraphQL toggleResourceActive error:', error);
      return { success: false, message: 'Помилка зміни статусу' };
    }
  },

  toggleUserActive: async ({ id }, context) => {
    try {
      const admin = checkAdmin(context);

      const user = await User.findById(id);
      if (!user) {
        return { success: false, message: 'Користувача не знайдено' };
      }

      if (user._id.toString() === admin.userId) {
        return { success: false, message: 'Не можна деактивувати власний акаунт' };
      }

      user.isActive = !user.isActive;
      await user.save();

      return {
        success: true,
        message: `Користувача ${user.isActive ? 'активовано' : 'деактивовано'}`
      };
    } catch (error) {
      console.error('GraphQL toggleUserActive error:', error);
      return { success: false, message: 'Помилка зміни статусу користувача' };
    }
  }
};

module.exports = resolvers;
