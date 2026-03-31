const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для виправлення тестового ресурсу
 */
const fixTestResource = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо тестовий ресурс
    const testResource = await Resource.findOne({ title: "тест" });
    
    if (!testResource) {
      console.log(' Тестовий ресурс не знайдено');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n Знайдено тестовий ресурс:`);
    console.log(`   Назва: "${testResource.title}"`);
    console.log(`   Опис: "${testResource.description}"`);
    console.log(`   Довжина опису: ${testResource.description.length}`);

    // Знаходимо адміна
    const adminUser = await User.findOne({ role: 'admin' });
    
    // Виправляємо ресурс
    testResource.description = "Тестовий ресурс для перевірки функціональності системи";
    testResource.author = adminUser._id;
    
    await testResource.save();
    
    console.log(`\n Виправлено:`);
    console.log(`   Новий опис: "${testResource.description}"`);
    console.log(`   Новий автор: ${adminUser.email}`);

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
fixTestResource();
