const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
const { buildPublicResourceQuery } = require('../services/resourceService');
require('dotenv').config();

/**
 * Скрипт для тестування запиту
 */
const testQuery = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Тестуємо запит як в API
    const queryParams = { page: 1, limit: 12 };
    const query = buildPublicResourceQuery(queryParams);
    
    console.log(`\n Запит для API:`);
    console.log(JSON.stringify(query, null, 2));

    // Виконуємо запит
    const resources = await Resource.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(12);

    console.log(`\n Знайдено ресурсів: ${resources.length}`);

    if (resources.length > 0) {
      console.log('\n Перші ресурси:');
      resources.forEach((resource, index) => {
        console.log(`   ${index + 1}. "${resource.title}" - ${resource.category}`);
        console.log(`      Автор: ${resource.author ? `${resource.author.firstName} ${resource.author.lastName}` : 'Невідомо'}`);
      });
    }

    // Рахуємо загальну кількість
    const total = await Resource.countDocuments(query);
    console.log(`\n Загальна кількість: ${total}`);

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
testQuery();
