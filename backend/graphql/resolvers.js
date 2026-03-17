const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { sendVerificationEmail } = require('../utils/email');

/**
 * Перевіряє чи користувач автентифікований
 * @param {Object} context - GraphQL context з даними користувача
 * @returns {Object} - Дані користувача
 * @throws {Error} - Якщо користувач не автентифікований
 */
const checkAuth = (context) => {
  if (!context.user) {
    throw new Error('Не авторизовано. Будь ласка, увійдіть в систему.');
  }
  return context.user;
};

/**
 * Перевіряє чи користувач має права адміністратора
 * @param {Object} context - GraphQL context з даними користувача
 * @returns {Object} - Дані користувача
 * @throws {Error} - Якщо користувач не є адміністратором
 */
const checkAdmin = (context) => {
  const user = checkAuth(context);
  if (user.role !== 'admin') {
    throw new Error('Доступ заборонено. Потрібні права адміністратора.');
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

      // Базовий запит для активних та схвалених ресурсів
      let query = { 
        isActive: true, 
        isApproved: true 
      };

      // Додавання фільтрів до запиту
      if (filter?.category) {
        query.category = filter.category;
      }

      if (filter?.search) {
        // Використовуємо regex для часткового пошуку
        query.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { description: { $regex: filter.search, $options: 'i' } }
        ];
      }

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
      // Валідація ID
      if (!id) {
        return formatResponse(false, null, 'ID ресурсу є обов\'язковим');
      }

      const resource = await Resource.findById(id)
        .populate('author', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName');

      if (!resource) {
        return formatResponse(false, null, 'Ресурс не знайдено');
      }

      // Інкремент кількості переглядів
      resource.views = (resource.views || 0) + 1;
      await resource.save();

      return formatResponse(true, { resource }, null);
    } catch (error) {
      console.error('GraphQL resource error:', error);
      return formatResponse(false, null, 'Помилка завантаження ресурсу');
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
  /**
   * Реєстрація нового користувача з відправкою email верифікації
   * @param {Object} args - Аргументи GraphQL запиту
   * @param {Object} args.input - Дані для реєстрації
   * @returns {Object} - Результат реєстрації
   */
  register: async ({ input }) => {
    try {
      const { firstName, lastName, email, password } = input;

      // Валідація вхідних даних
      if (!firstName || !lastName || !email || !password) {
        return formatResponse(false, null, 'Всі поля є обов\'язковими');
      }

      // Перевірка чи користувач вже існує
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return formatResponse(false, null, 'Користувач з таким email вже існує');
      }

      // Генерація токену для верифікації email
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Створення нового користувача
      const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
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

      return formatResponse(true, { 
        user: userData 
      }, 'Реєстрація успішна. Перевірте email для підтвердження.');
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
      const { email, password } = input;

      // Валідація вхідних даних
      if (!email || !password) {
        return formatResponse(false, null, 'Email та пароль є обов\'язковими');
      }

      // Пошук користувача
      const user = await User.findOne({ email: email.toLowerCase().trim() });
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

      return formatResponse(true, { 
        token,
        user: userData 
      }, 'Вхід успішний');
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

      // Валідація вхідних даних
      const { title, description, category, url, tags } = input;
      
      if (!title || !description || !category || !url) {
        return formatResponse(false, null, 'Назва, опис, категорія та URL є обов\'язковими полями');
      }

      // Валідація довжини полів
      if (title.length > 200) {
        return formatResponse(false, null, 'Назва не може перевищувати 200 символів');
      }

      if (description.length > 2000) {
        return formatResponse(false, null, 'Опис не може перевищувати 2000 символів');
      }

      if (url.length > 500) {
        return formatResponse(false, null, 'URL не може перевищувати 500 символів');
      }

      // Валідація категорії
      const validCategories = ['education', 'technology', 'health', 'business', 'entertainment', 'other'];
      if (!validCategories.includes(category)) {
        return formatResponse(false, null, 'Невірна категорія');
      }

      // Створення нового ресурсу
      const resourceData = {
        title: title.trim(),
        description: description.trim(),
        category,
        url: url.trim(),
        tags: Array.isArray(tags) ? tags : [],
        author: user.userId,
        isActive: true,
        isApproved: false, // Потрібна модерація
        views: 0
      };

      const resource = new Resource(resourceData);
      await resource.save();
      
      // Отримання ресурсу з даними автора
      await resource.populate('author', 'firstName lastName');

      return formatResponse(true, { 
        resource 
      }, 'Ресурс створено. Очікує модерації.');
    } catch (error) {
      console.error('GraphQL createResource error:', error);
      return formatResponse(false, null, 'Помилка створення ресурсу');
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
