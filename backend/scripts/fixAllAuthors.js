const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для виправлення всіх авторів ресурсів
 */
const fixAllAuthors = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо всіх користувачів
    const users = await User.find({});
    console.log(`\n Поточні користувачі:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user._id})`);
    });

    // Знаходимо старий ID, на який посилаються ресурси
    const sampleResource = await Resource.findOne({});
    const oldAuthorId = sampleResource.author;
    console.log(`\n Старий ID автора в ресурсах: ${oldAuthorId}`);

    // Перевіряємо чи існує користувач з цим ID
    const oldUser = await User.findById(oldAuthorId);
    console.log(` Користувач зі старим ID знайдено: ${oldUser ? 'ТАК' : 'НІ'}`);
    if (oldUser) {
      console.log(`   Email: ${oldUser.email}`);
    }

    // Використовуємо першого адміна як нового автора
    const newAdmin = users.find(u => u.role === 'admin');
    if (!newAdmin) {
      console.log(' Помилка: адміністраторів не знайдено');
      return;
    }

    console.log(`\n Новий автор для всіх ресурсів:`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   ID: ${newAdmin._id}`);

    // Оновлюємо всі ресурси
    const result = await Resource.updateMany(
      { author: oldAuthorId },
      { author: newAdmin._id }
    );

    console.log(`\n Оновлено ресурсів: ${result.modifiedCount}`);

    // Перевіряємо результат
    const testResource = await Resource.findOne({}).populate('author');
    console.log(`\n Перевірка:`);
    console.log(`   Ресурс: "${testResource.title}"`);
    console.log(`   Автор: ${testResource.author ? testResource.author.email : 'ПОМИЛКА'}`);

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
fixAllAuthors();
