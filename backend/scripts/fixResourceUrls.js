const mongoose = require('mongoose');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для виправлення URL відсутніх ресурсів
 */
const fixResourceUrls = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо ресурси без URL
    const resourcesWithoutUrl = await Resource.find({ 
      $or: [
        { url: null },
        { url: '' },
        { url: { $exists: false } }
      ]
    });

    console.log(`\n Знайдено ресурсів без URL: ${resourcesWithoutUrl.length}`);

    if (resourcesWithoutUrl.length === 0) {
      console.log(' Всі ресурси мають URL');
      await mongoose.disconnect();
      return;
    }

    // Дефолтні URL для кожної категорії
    const defaultUrls = {
      'education': 'https://example.com/education',
      'technology': 'https://example.com/technology', 
      'health': 'https://example.com/health',
      'business': 'https://example.com/business',
      'entertainment': 'https://example.com/entertainment',
      'other': 'https://example.com/other'
    };

    // Виправляємо кожен ресурс
    let fixedCount = 0;
    for (const resource of resourcesWithoutUrl) {
      const defaultUrl = defaultUrls[resource.category] || 'https://example.com/other';
      
      resource.url = defaultUrl;
      await resource.save();
      fixedCount++;
      
      console.log(`   Виправлено: "${resource.title}" -> ${defaultUrl}`);
    }

    console.log(`\n Успішно виправлено ${fixedCount} ресурсів`);

    // Перевіряємо результат
    const remainingWithoutUrl = await Resource.find({ 
      $or: [
        { url: null },
        { url: '' },
        { url: { $exists: false } }
      ]
    });

    console.log(` Залишилось ресурсів без URL: ${remainingWithoutUrl.length}`);

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
fixResourceUrls();
