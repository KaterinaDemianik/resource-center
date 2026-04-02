const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dns = require('dns').promises;
const { GraphQLError } = require('graphql');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { sendVerificationEmail } = require('../utils/email');
const { createNotification } = require('../routes/notifications');
const {
  buildPublicResourceQuery,
  buildAdminResourceStatusQuery,
  mergeAdminQueryWithSearch
} = require('../services/resourceService');

/**
 * Перевіряє чи користувач автентифікований
 */
const checkAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError('Не авторизовано. Будь ласка, увійдіть в систему.', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return context.user;
};

/**
 * Перевіряє чи користувач має права адміністратора
 */
const checkAdmin = (context) => {
  const user = checkAuth(context);
  if (user.role !== 'admin') {
    throw new GraphQLError('Доступ заборонено. Потрібні права адміністратора.', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
  return user;
};

/**
 * Форматує відповідь GraphQL операції
 * @param {boolean} success - Статус операції
 * @param {*} data - Дані для повернення
 * @param {string} message - Повідомлення про помилку
 * @returns {Object} - Форматована відповідь
 */
const formatResponse = (success, data = null, message = null) => {
  const response = { success };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
};

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
const VALID_CATEGORIES = ['education', 'technology', 'health', 'business', 'entertainment', 'other'];

const verifyEmailDomain = async (email) => {
  try {
    const domain = email.split('@')[1];
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    return false;
  }
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const validateResourcePayload = (input, { requireAllFields = false } = {}) => {
  const normalized = {
    title: input.title !== undefined ? normalizeString(input.title) : undefined,
    description: input.description !== undefined ? normalizeString(input.description) : undefined,
    category: input.category !== undefined ? input.category : undefined,
    url: input.url !== undefined ? normalizeString(input.url) : undefined,
    tags: input.tags !== undefined ? input.tags : undefined
  };

  if (requireAllFields) {
    if (!normalized.title || !normalized.description || !normalized.category || !normalized.url) {
      return { valid: false, message: 'Назва, опис, категорія та URL є обов\'язковими полями' };
    }
  }

  if (normalized.title !== undefined) {
    if (!normalized.title) {
      return { valid: false, message: 'Назва не може бути порожньою' };
    }
    if (normalized.title.length > 200) {
      return { valid: false, message: 'Назва не може перевищувати 200 символів' };
    }
  }

  if (normalized.description !== undefined) {
    if (!normalized.description) {
      return { valid: false, message: 'Опис не може бути порожнім' };
    }
    if (normalized.description.length > 1000) {
      return { valid: false, message: 'Опис не може перевищувати 1000 символів' };
    }
  }

  if (normalized.category !== undefined && !VALID_CATEGORIES.includes(normalized.category)) {
    return { valid: false, message: 'Невірна категорія' };
  }

  if (normalized.tags !== undefined) {
    if (!Array.isArray(normalized.tags)) {
      return { valid: false, message: 'Теги мають бути масивом' };
    }

    for (const tag of normalized.tags) {
      const normalizedTag = normalizeString(tag);
      if (!normalizedTag) {
        return { valid: false, message: 'Тег не може бути порожнім' };
      }
      if (normalizedTag.length > 30) {
        return { valid: false, message: 'Кожен тег не може перевищувати 30 символів' };
      }
    }
  }

  if (normalized.url !== undefined) {
    if (!normalized.url) {
      return { valid: false, message: 'URL не може бути порожнім' };
    }
    if (!URL_REGEX.test(normalized.url)) {
      return { valid: false, message: 'Будь ласка, введіть коректний URL' };
    }
  }

  return {
    valid: true,
    normalized: {
      ...normalized,
      tags: normalized.tags !== undefined
        ? normalized.tags.map((tag) => normalizeString(tag))
        : undefined
    }
  };
};

const resolvers = {
  // Queries
  /**
   * Отримує список ресурсів з фільтрацією та пагінацією
   * @param {Object} args - Аргументи GraphQL запиту
   * @param {Object} args.filter - Фільтри для пошуку
   * @returns {Object} - Список ресурсів з пагінацією
   */
  resources: async ({ filter }) => {
    try {
      // Параметри пагінації
      const page = Math.max(1, filter?.page || 1);
      const limit = Math.min(Math.max(1, filter?.limit || 10), 50);
      const skip = (page - 1) * limit;

      const query = buildPublicResourceQuery({
        category: filter?.category,
        search: filter?.search
      });

      // Отримання ресурсів з популяцією автора
      const resources = await Resource.find(query)
        .populate('author', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Підрахунок загальної кількості для пагінації
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
      return formatResponse(false, null, 'Помилка завантаження ресурсів');
    }
  },

  /**
   * Отримує один ресурс за ID з інкрементом переглядів
   * @param {Object} args - Аргументи GraphQL запиту
   * @param {string} args.id - ID ресурсу
   * @returns {Object} - Дані ресурсу або помилка
   */
  resource: async ({ id }) => {
    try {
      if (!id) {
        return { success: false, message: 'ID ресурсу є обов\'язковим', resource: null };
      }

      const resource = await Resource.findById(id)
        .populate('author', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName');

      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено', resource: null };
      }

      // Інкремент кількості переглядів
      resource.views = (resource.views || 0) + 1;
      await resource.save();

      const resourceObj = resource.toObject({ virtuals: true });
      resourceObj.id = resource._id.toString();
      resourceObj.createdAt = resource.createdAt?.toISOString() || null;
      resourceObj.updatedAt = resource.updatedAt?.toISOString() || null;
      if (resource.approvedAt) resourceObj.approvedAt = resource.approvedAt.toISOString();

      return { success: true, message: '', resource: resourceObj };
    } catch (error) {
      console.error('GraphQL resource error:', error);
      return { success: false, message: 'Помилка завантаження ресурсу', resource: null };
    }
  },

  me: async (args, context) => {
    try {
      const user = checkAuth(context);
      return await User.findById(user.userId);
    } catch (error) {
      if (error instanceof GraphQLError && error.extensions?.code === 'UNAUTHENTICATED') {
        return null;
      }
      throw error;
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
      const normalizedResources = resources.map((resource) => {
        const resourceObj = resource.toObject({ virtuals: true });
        resourceObj.id = resource._id.toString();
        resourceObj.createdAt = resource.createdAt?.toISOString() || null;
        resourceObj.updatedAt = resource.updatedAt?.toISOString() || null;
        resourceObj.approvedAt = resource.approvedAt?.toISOString() || null;
        return resourceObj;
      });

      return {
        success: true,
        resources: normalizedResources,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      console.error('GraphQL myResources error:', error);
      return { success: false, resources: [], total: 0 };
    }
  },

  adminResources: async ({ status, search, page = 1, limit = 10 }, context) => {
    try {
      checkAdmin(context);
      const skip = (page - 1) * limit;

      const normalizedStatus = status === 'all' ? 'approved' : status;
      const baseQuery =
        normalizedStatus && ['pending', 'approved', 'inactive', 'rejected'].includes(normalizedStatus)
          ? buildAdminResourceStatusQuery(normalizedStatus)
          : {};
      const query = mergeAdminQueryWithSearch(baseQuery, search);

      const resources = await Resource.find(query)
        .populate('author', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Resource.countDocuments(query);
      const normalizedResources = resources.map((resource) => {
        const resourceObj = resource.toObject({ virtuals: true });
        resourceObj.id = resource._id.toString();
        resourceObj.createdAt = resource.createdAt?.toISOString() || null;
        resourceObj.updatedAt = resource.updatedAt?.toISOString() || null;
        resourceObj.approvedAt = resource.approvedAt?.toISOString() || null;
        return resourceObj;
      });

      return {
        success: true,
        resources: normalizedResources,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
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
      const normalizedUsers = users.map((user) => {
        const userObj = user.toObject({ virtuals: true });
        userObj.id = user._id.toString();
        userObj.createdAt = user.createdAt?.toISOString() || null;
        userObj.updatedAt = user.updatedAt?.toISOString() || null;
        return userObj;
      });

      return { success: true, users: normalizedUsers, total };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      console.error('GraphQL adminUsers error:', error);
      return { success: false, users: [], total: 0 };
    }
  },

  adminStats: async (args, context) => {
    try {
      checkAdmin(context);

      const approvedQuery = buildAdminResourceStatusQuery('approved');
      const pendingQuery = buildAdminResourceStatusQuery('pending');

      const [totalUsers, activeUsers, totalResources, approvedResources, pendingResources] = 
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ isActive: true, emailVerified: true }),
          Resource.countDocuments(),
          Resource.countDocuments(approvedQuery),
          Resource.countDocuments(pendingQuery)
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
      if (error instanceof GraphQLError) throw error;
      console.error('GraphQL adminStats error:', error);
      return { success: false };
    }
  },

  // Mutations
  /**
   * Реєстрація нового користувача з відправкою email верифікації
   * @param {Object} args - Аргументи GraphQL запиту
   * @param {Object} args.input - Дані для реєстрації
   * @returns {Object} - Результат реєстрації
   */
  register: async ({ input }) => {
    try {
      const firstName = normalizeString(input.firstName);
      const lastName = normalizeString(input.lastName);
      const email = normalizeString(input.email).toLowerCase();
      const password = input.password;

      if (!firstName || !lastName || !email || !password) {
        return formatResponse(false, null, 'Всі поля є обов\'язковими');
      }

      if (firstName.length > 50) {
        return formatResponse(false, null, 'Ім\'я не може перевищувати 50 символів');
      }

      if (lastName.length > 50) {
        return formatResponse(false, null, 'Прізвище не може перевищувати 50 символів');
      }

      if (!EMAIL_REGEX.test(email)) {
        return formatResponse(false, null, 'Будь ласка, введіть коректний email');
      }

      if (password.length < 6) {
        return formatResponse(false, null, 'Пароль має містити щонайменше 6 символів');
      }

      const isValidDomain = await verifyEmailDomain(email);
      if (!isValidDomain) {
        return formatResponse(false, null, 'Email адреса недійсна. Перевірте правильність введеного домену.');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return formatResponse(false, null, 'Користувач з таким email вже існує');
      }

      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        emailVerificationToken
      });

      await user.save();

      // Відправка email для верифікації
      try {
        await sendVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Не зупиняємо реєстрацію, якщо email не відправлено
        return formatResponse(false, null, 'Помилка відправки email. Спробуйте пізніше.');
      }

      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };

      return {
        success: true,
        message: 'Реєстрація успішна. Перевірте email для підтвердження.',
        token: null,
        user: userData
      };
    } catch (error) {
      console.error('GraphQL register error:', error);
      return formatResponse(false, null, 'Помилка реєстрації');
    }
  },

  /**
   * Авторизація користувача з перевіркою валідації
   * @param {Object} args - Аргументи GraphQL запиту
   * @param {Object} args.input - Дані для входу
   * @returns {Object} - JWT токен та дані користувача
   */
  login: async ({ input }) => {
    try {
      const email = normalizeString(input.email).toLowerCase();
      const password = input.password;

      if (!email || !password) {
        return formatResponse(false, null, 'Email та пароль є обов\'язковими');
      }

      if (!EMAIL_REGEX.test(email)) {
        return formatResponse(false, null, 'Будь ласка, введіть коректний email');
      }

      const user = await User.findOne({ email });
      if (!user) {
        return formatResponse(false, null, 'Невірні облікові дані');
      }

      // Перевірка статусу акаунту
      if (!user.emailVerified) {
        return formatResponse(false, null, 'Підтвердіть email перед входом');
      }

      if (!user.isActive) {
        return formatResponse(false, null, 'Акаунт деактивовано');
      }

      // Перевірка паролю
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return formatResponse(false, null, 'Невірні облікові дані');
      }

      // Генерація JWT токену
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      };

      return {
        success: true,
        message: 'Вхід успішний',
        token,
        user: userData
      };
    } catch (error) {
      console.error('GraphQL login error:', error);
      return formatResponse(false, null, 'Помилка входу');
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

  changePassword: async ({ input }, context) => {
    try {
      const authUser = checkAuth(context);

      const currentPassword = input.currentPassword;
      const newPassword = input.newPassword;

      if (!currentPassword || !newPassword) {
        return { success: false, message: 'Поточний та новий паролі є обов\'язковими' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'Новий пароль має містити щонайменше 6 символів' };
      }

      const user = await User.findById(authUser.userId);
      if (!user) {
        return { success: false, message: 'Користувача не знайдено' };
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return { success: false, message: 'Поточний пароль невірний' };
      }

      user.password = newPassword;
      await user.save();

      return { success: true, message: 'Пароль успішно змінено' };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      console.error('GraphQL changePassword error:', error);
      return { success: false, message: 'Помилка зміни паролю' };
    }
  },

  /**
   * Створення нового ресурсу з валідацією даних
   * @param {Object} args - Аргументи GraphQL запиту
   * @param {Object} args.input - Дані ресурсу
   * @param {Object} context - GraphQL context з даними користувача
   * @returns {Object} - Створений ресурс або помилка
   */
  createResource: async ({ input }, context) => {
    try {
      const user = checkAuth(context);

      const validation = validateResourcePayload(input, { requireAllFields: true });
      if (!validation.valid) {
        return { success: false, message: validation.message, resource: null };
      }

      const {
        title,
        description,
        category,
        url,
        tags
      } = validation.normalized;

      if (url.length > 500) {
        return { success: false, message: 'URL не може перевищувати 500 символів', resource: null };
      }

      const resourceData = {
        title,
        description,
        category,
        url,
        tags: Array.isArray(tags) ? tags : [],
        author: user.userId,
        isActive: true,
        isApproved: false,
        views: 0
      };

      const resource = new Resource(resourceData);
      await resource.save();
      
      // Отримання ресурсу з даними автора
      await resource.populate('author', 'firstName lastName');

      return { success: true, message: 'Ресурс створено. Очікує модерації.', resource };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      console.error('GraphQL createResource error:', error);
      return { success: false, message: 'Помилка створення ресурсу', resource: null };
    }
  },

  updateResource: async ({ id, input }, context) => {
    try {
      const user = checkAuth(context);

      const validation = validateResourcePayload(input, { requireAllFields: false });
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const resource = await Resource.findById(id);
      if (!resource) {
        return { success: false, message: 'Ресурс не знайдено' };
      }

      // Check ownership or admin
      if (resource.author.toString() !== user.userId && user.role !== 'admin') {
        return { success: false, message: 'Немає прав на редагування' };
      }

      Object.keys(validation.normalized).forEach(key => {
        if (validation.normalized[key] !== undefined) {
          resource[key] = validation.normalized[key];
        }
      });

      if (validation.normalized.url && validation.normalized.url.length > 500) {
        return { success: false, message: 'URL не може перевищувати 500 символів' };
      }

      if (validation.normalized.title || validation.normalized.description || validation.normalized.url) {
        resource.isApproved = false;
        resource.approvedBy = null;
        resource.approvedAt = null;
      }

      await resource.save();
      await resource.populate('author', 'firstName lastName');

      return { success: true, message: 'Ресурс оновлено', resource };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
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
      if (error instanceof GraphQLError) throw error;
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
      resource.isActive = true;
      resource.approvedBy = user.userId;
      resource.approvedAt = new Date();
      resource.rejectedAt = null;
      await resource.save();

      await resource.populate(['author', 'approvedBy']);

      await createNotification(
        resource.author._id,
        'resource_approved',
        'Ресурс схвалено',
        `Ваш ресурс "${resource.title}" був схвалений модератором і тепер доступний для всіх користувачів.`,
        resource._id
      );

      return { success: true, message: 'Ресурс схвалено', resource };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
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

      await createNotification(
        resource.author._id,
        'resource_rejected',
        'Ресурс відхилено',
        `Ваш ресурс "${resource.title}" був відхилений модератором. Будь ласка, перевірте відповідність правилам та спробуйте знову.`,
        resource._id
      );

      return { success: true, message: 'Схвалення відхилено', resource };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
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

      const wasActive = resource.isActive;
      resource.isActive = !resource.isActive;
      await resource.save();

      await resource.populate(['author', 'approvedBy']);

      if (wasActive && !resource.isActive) {
        await createNotification(
          resource.author._id,
          'resource_deactivated',
          'Ресурс деактивовано',
          `Ваш ресурс "${resource.title}" був деактивований адміністратором.`,
          resource._id
        );
      }

      return {
        success: true,
        message: `Ресурс ${resource.isActive ? 'активовано' : 'деактивовано'}`,
        resource
      };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
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
      if (error instanceof GraphQLError) throw error;
      console.error('GraphQL toggleUserActive error:', error);
      return { success: false, message: 'Помилка зміни статусу користувача' };
    }
  }
};

module.exports = resolvers;
