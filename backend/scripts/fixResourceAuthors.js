const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для виправлення авторів ресурсів
 */
const fixResourceAuthors = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо всіх адміністраторів
    const admins = await User.find({ role: 'admin' });
    console.log(` Знайдено адміністраторів: ${admins.length}`);

    if (admins.length === 0) {
      console.log(' Помилка: адміністраторів не знайдено');
      return;
    }

    // Використовуємо першого адміна для всіх ресурсів
    const defaultAdmin = admins[0];
    console.log(` Використовуємо адміна: ${defaultAdmin.email}`);

    // Знаходимо ресурси без автора або з невалідним автором
    const resourcesWithoutAuthor = await Resource.find({
      $or: [
        { author: null },
        { author: undefined },
        { author: { $exists: false } }
      ]
    });

    console.log(`\n Знайдено ресурсів без автора: ${resourcesWithoutAuthor.length}`);

    if (resourcesWithoutAuthor.length === 0) {
      console.log(' Всі ресурси мають авторів');
      
      // Перевіримо поточний стан
      const allResources = await Resource.find({}).populate('author');
      console.log(`\n Загальна кількість ресурсів: ${allResources.length}`);
      
      let withValidAuthor = 0;
      allResources.forEach(resource => {
        if (resource.author && resource.author.email) {
          withValidAuthor++;
        }
      });
      
      console.log(` Ресурсів з валідним автором: ${withValidAuthor}`);
      await mongoose.disconnect();
      return;
    }

    // Оновлюємо ресурси
    let updatedCount = 0;
    for (const resource of resourcesWithoutAuthor) {
      resource.author = defaultAdmin._id;
      await resource.save();
      updatedCount++;
      
      console.log(`   Оновлено: "${resource.title}"`);
    }

    console.log(`\n Успішно оновлено ${updatedCount} ресурсів`);

    // Перевіряємо результат
    const updatedResources = await Resource.find({}).populate('author');
    let validAuthors = 0;
    
    updatedResources.forEach(resource => {
      if (resource.author && resource.author.email) {
        validAuthors++;
      }
    });

    console.log(`\n Перевірка результату:`);
    console.log(`   Загальна кількість ресурсів: ${updatedResources.length}`);
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
fixResourceAuthors();
