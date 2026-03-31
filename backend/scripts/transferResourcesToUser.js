const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для передачі всіх ресурсів адміна користувачеві k.demianik12@gmail.com
 */
const transferResourcesToUser = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо користувача k.demianik12@gmail.com
    const targetUser = await User.findOne({ email: 'k.demianik12@gmail.com' });
    
    if (!targetUser) {
      console.log(' Помилка: користувача k.demianik12@gmail.com не знайдено');
      console.log(' Спочатку зареєструйте цього користувача');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n Цільовий користувач:`);
    console.log(`   Email: ${targetUser.email}`);
    console.log(`   Ім'я: ${targetUser.firstName} ${targetUser.lastName}`);
    console.log(`   ID: ${targetUser._id}`);
    console.log(`   Роль: ${targetUser.role}`);

    // Знаходимо всі ресурси
    const allResources = await Resource.find({});
    console.log(`\n Знайдено ресурсів для передачі: ${allResources.length}`);

    if (allResources.length === 0) {
      console.log(' Ресурсів для передачі немає');
      await mongoose.disconnect();
      return;
    }

    // Показуємо поточних авторів
    console.log('\n Поточні автори ресурсів:');
    const authorCounts = {};
    for (const resource of allResources) {
      if (resource.author) {
        const authorId = resource.author.toString();
        authorCounts[authorId] = (authorCounts[authorId] || 0) + 1;
      }
    }

    // Знаходимо поточних авторів
    for (const authorId of Object.keys(authorCounts)) {
      const author = await User.findById(authorId);
      if (author) {
        console.log(`   ${author.email}: ${authorCounts[authorId]} ресурсів`);
      } else {
        console.log(`   Невідомий автор (${authorId}): ${authorCounts[authorId]} ресурсів`);
      }
    }

    // Питаємо підтвердження
    console.log(`\n Будь ласка, підтвердіть передачу всіх ${allResources.length} ресурсів користувачу ${targetUser.email}`);
    console.log(' Натисніть Enter для продовження або Ctrl+C для скасування...');
    
    // Оновлюємо всі ресурси
    let updatedCount = 0;
    for (const resource of allResources) {
      const oldAuthorId = resource.author ? resource.author.toString() : null;
      
      // Оновлюємо автора
      resource.author = targetUser._id;
      await resource.save();
      updatedCount++;
      
      if (updatedCount <= 5 || updatedCount % 10 === 0) {
        console.log(`   Оновлено ${updatedCount}/${allResources.length} ресурсів...`);
      }
    }

    console.log(`\n Успішно оновлено ${updatedCount} ресурсів`);

    // Перевіряємо результат
    const updatedResources = await Resource.find({}).populate('author');
    let correctAuthorCount = 0;
    
    updatedResources.forEach(resource => {
      if (resource.author && resource.author.email === 'k.demianik12@gmail.com') {
        correctAuthorCount++;
      }
    });

    console.log(`\n Перевірка результату:`);
    console.log(`   Ресурсів з правильним автором: ${correctAuthorCount}/${updatedResources.length}`);

    if (correctAuthorCount === updatedResources.length) {
      console.log(' ✅ Всі ресурси успішно передано!');
    } else {
      console.log(' ⚠️  Не всі ресурси передано коректно');
    }

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
transferResourcesToUser();
