const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

const testResources = [
  {
    title: 'Дистанційне навчання для студентів',
    description: 'Платформа для онлайн навчання з інтерактивними курсами та матеріалами для студентів різних спеціальностей',
    category: 'education',
    tags: ['навчання', 'онлайн', 'курси', 'студенти'],
    url: 'https://example.com/distance-learning'
  },
  {
    title: 'Програмування для початківців',
    description: 'Безкоштовні курси програмування JavaScript, Python, HTML/CSS для початківців з практичними завданнями',
    category: 'technology',
    tags: ['програмування', 'JavaScript', 'Python', 'курси'],
    url: 'https://example.com/programming-basics'
  },
  {
    title: 'Онлайн бібліотека навчальних матеріалів',
    description: 'Велика колекція підручників, статей та відео-лекцій з різних предметів для самостійного навчання',
    category: 'education',
    tags: ['бібліотека', 'підручники', 'навчання', 'матеріали'],
    url: 'https://example.com/library'
  },
  {
    title: 'Веб-розробка: повний курс',
    description: 'Комплексний курс веб-розробки від основ HTML до React та Node.js з реальними проєктами',
    category: 'technology',
    tags: ['веб-розробка', 'React', 'Node.js', 'HTML', 'CSS'],
    url: 'https://example.com/web-development'
  },
  {
    title: 'Здоровий спосіб життя: поради та рекомендації',
    description: 'Корисні поради щодо здорового харчування, фізичних вправ та підтримки ментального здоров\'я',
    category: 'health',
    tags: ['здоров\'я', 'фітнес', 'харчування', 'спорт'],
    url: 'https://example.com/healthy-lifestyle'
  },
  {
    title: 'Основи бізнесу та підприємництва',
    description: 'Навчальні матеріали для початківців підприємців: від бізнес-плану до маркетингу та фінансів',
    category: 'business',
    tags: ['бізнес', 'підприємництво', 'стартап', 'маркетинг'],
    url: 'https://example.com/business-basics'
  },
  {
    title: 'Дизайн інтерфейсів: UI/UX курс',
    description: 'Вивчення принципів дизайну користувацьких інтерфейсів, UX досліджень та прототипування',
    category: 'technology',
    tags: ['дизайн', 'UI', 'UX', 'інтерфейси', 'Figma'],
    url: 'https://example.com/ui-ux-design'
  },
  {
    title: 'Англійська мова онлайн',
    description: 'Інтерактивні уроки англійської мови для різних рівнів з аудіо, відео та тестами',
    category: 'education',
    tags: ['англійська', 'мови', 'навчання', 'онлайн'],
    url: 'https://example.com/english-online'
  },
  {
    title: 'Фінансова грамотність для всіх',
    description: 'Базові знання про управління особистими фінансами, інвестиції та заощадження',
    category: 'business',
    tags: ['фінанси', 'інвестиції', 'бюджет', 'заощадження'],
    url: 'https://example.com/financial-literacy'
  },
  {
    title: 'Медитація та mindfulness практики',
    description: 'Техніки медитації, дихальні вправи та практики усвідомленості для зменшення стресу',
    category: 'health',
    tags: ['медитація', 'mindfulness', 'стрес', 'релаксація'],
    url: 'https://example.com/meditation'
  },
  {
    title: 'Мистецтво та культура України',
    description: 'Огляд української культури, історії мистецтва, музеїв та культурних подій',
    category: 'entertainment',
    tags: ['мистецтво', 'культура', 'Україна', 'історія'],
    url: 'https://example.com/ukrainian-culture'
  },
  {
    title: 'Data Science та Machine Learning',
    description: 'Вступ до науки про дані, машинного навчання та штучного інтелекту з Python',
    category: 'technology',
    tags: ['data science', 'machine learning', 'AI', 'Python'],
    url: 'https://example.com/data-science'
  }
];

async function addTestResources() {
  try {
    // Підключення до MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center');
    console.log('MongoDB підключено');

    // Знайти користувача
    const user = await User.findOne({ email: 'demianikkaterina@gmail.com' });
    
    if (!user) {
      console.log('Користувача demianikkaterina@gmail.com не знайдено');
      console.log('Створюю нового користувача...');
      
      // Створити користувача якщо не існує
      const newUser = new User({
        firstName: 'Katerina',
        lastName: 'Demianik',
        email: 'demianikkaterina@gmail.com',
        password: 'password123',
        role: 'user',
        emailVerified: true,
        isActive: true
      });
      
      await newUser.save();
      console.log('Користувача створено');
      
      // Додати ресурси для нового користувача
      await addResourcesForUser(newUser._id);
    } else {
      console.log(`Користувача знайдено: ${user.firstName} ${user.lastName}`);
      await addResourcesForUser(user._id);
    }

    console.log('Всі ресурси успішно додано!');
    process.exit(0);
  } catch (error) {
    console.error('Помилка:', error);
    process.exit(1);
  }
}

async function addResourcesForUser(userId) {
  let addedCount = 0;
  let approvedCount = 0;
  
  for (const resourceData of testResources) {
    // Перевірити чи ресурс вже існує
    const existing = await Resource.findOne({ 
      title: resourceData.title,
      author: userId 
    });
    
    if (existing) {
      console.log(`⏭Ресурс "${resourceData.title}" вже існує`);
      continue;
    }
    
    // Створити ресурс
    const resource = new Resource({
      ...resourceData,
      author: userId,
      isActive: true,
      // Частину ресурсів схвалюємо, частину залишаємо на модерації
      isApproved: addedCount % 3 !== 0, // Кожен третій на модерації
      approvedBy: addedCount % 3 !== 0 ? userId : null,
      approvedAt: addedCount % 3 !== 0 ? new Date() : null
    });
    
    await resource.save();
    addedCount++;
    
    if (resource.isApproved) {
      approvedCount++;
      console.log(`Додано та схвалено: "${resourceData.title}"`);
    } else {
      console.log(`Додано (на модерації): "${resourceData.title}"`);
    }
  }
  
  console.log(`\nСтатистика:`);
  console.log(`   Всього додано: ${addedCount}`);
  console.log(`   Схвалено: ${approvedCount}`);
  console.log(`   На модерації: ${addedCount - approvedCount}`);
}

// Запустити скрипт
addTestResources();
