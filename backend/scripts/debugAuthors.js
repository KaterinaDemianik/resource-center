const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для діагностики проблем з авторами
 */
const debugAuthors = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Отримуємо всіх користувачів з їх ID
    const users = await User.find({});
    console.log(`\n Користувачі в базі:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user._id})`);
    });

    // Перевіряємо перші 3 ресурси детально
    const resources = await Resource.find({}).limit(3);
    console.log(`\n Детальна інформація про ресурси:`);
    
    for (const resource of resources) {
      console.log(`\n Ресурс: "${resource.title}"`);
      console.log(`   Author field: ${resource.author}`);
      console.log(`   Author type: ${typeof resource.author}`);
      console.log(`   Author is ObjectId: ${mongoose.Types.ObjectId.isValid(resource.author)}`);
      
      if (resource.author) {
        // Спробуємо знайти користувача за цим ID
        const authorUser = await User.findById(resource.author);
        console.log(`   Знайдений автор: ${authorUser ? authorUser.email : 'НЕ ЗНАЙДЕНО'}`);
      }
    }

    // Перевіряємо скільки ресурсів з валідними ObjectId
    let validObjectIdCount = 0;
    let nullAuthorCount = 0;
    let invalidAuthorCount = 0;

    const allResources = await Resource.find({});
    
    for (const resource of allResources) {
      if (!resource.author) {
        nullAuthorCount++;
      } else if (mongoose.Types.ObjectId.isValid(resource.author)) {
        validObjectIdCount++;
      } else {
        invalidAuthorCount++;
      }
    }

    console.log(`\n Статистика авторів:`);
    console.log(`   Ресурсів без автора (null): ${nullAuthorCount}`);
    console.log(`   Ресурсів з валідним ObjectId: ${validObjectIdCount}`);
    console.log(`   Ресурсів з невалідним автором: ${invalidAuthorCount}`);

    // Відключення від БД
    await mongoose.disconnect();
    console.log('\n Відключено від MongoDB');
    
  } catch (error) {
    console.error(' Помилка:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Запуск скрипту
debugAuthors();
