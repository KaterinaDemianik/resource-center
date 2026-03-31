const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для виправлення решти авторів
 */
const fixRemainingAuthors = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо всіх користувачів
    const users = await User.find({});
    const adminUser = users.find(u => u.role === 'admin');
    
    console.log(`\n Використовуємо адміна: ${adminUser.email} (ID: ${adminUser._id})`);

    // Знаходимо ресурси з невідомими авторами
    const resourcesWithUnknownAuthors = await Resource.find({}).populate('author');
    let resourcesToFix = [];
    
    resourcesWithUnknownAuthors.forEach(resource => {
      if (!resource.author || !resource.author.email) {
        resourcesToFix.push(resource);
      }
    });

    console.log(`\n Знайдено ресурсів для виправлення: ${resourcesToFix.length}`);

    if (resourcesToFix.length === 0) {
      console.log(' Всі ресурси мають валідних авторів');
      await mongoose.disconnect();
      return;
    }

    // Оновлюємо кожен ресурс
    let fixedCount = 0;
    for (const resource of resourcesToFix) {
      resource.author = adminUser._id;
      await resource.save();
      fixedCount++;
      console.log(`   Виправлено: "${resource.title}"`);
    }

    console.log(`\n Виправлено ресурсів: ${fixedCount}`);

    // Перевіряємо результат
    const finalCheck = await Resource.find({}).populate('author');
    let validAuthors = 0;
    
    finalCheck.forEach(resource => {
      if (resource.author && resource.author.email) {
        validAuthors++;
      }
    });

    console.log(`\n Фінальна перевірка:`);
    console.log(`   Загальна кількість ресурсів: ${finalCheck.length}`);
    console.log(`   Ресурсів з валідним автором: ${validAuthors}`);

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
fixRemainingAuthors();
