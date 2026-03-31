const mongoose = require('mongoose');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для діагностики бази даних
 */
const debugDatabase = async () => {
  try {
    // Підключення до MongoDB з такими ж налаштуваннями як в server.js
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    console.log(' Підключаємось до:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    
    // Перевіряємо назву бази даних
    const dbName = mongoose.connection.name;
    console.log(' Назва бази даних:', dbName);
    
    // Перевіряємо колекції
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(' Колекції в базі:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Перевіряємо ресурси
    const resourceCount = await Resource.countDocuments();
    console.log(`\n Загальна кількість ресурсів: ${resourceCount}`);

    // Перевіряємо публічні ресурси
    const publicCount = await Resource.countDocuments({ isActive: true, isApproved: true });
    console.log(` Публічних ресурсів: ${publicCount}`);

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
debugDatabase();
