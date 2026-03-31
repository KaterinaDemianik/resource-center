const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для перевірки даних в базі даних
 */
const checkData = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Перевірка користувачів
    const users = await User.find({});
    console.log(`\n Користувачів в базі: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n Список користувачів:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role} - ${user.isActive ? 'активний' : 'неактивний'}${user.emailVerified ? ' - email підтверджено' : ''}`);
      });
    } else {
      console.log(' Користувачів не знайдено');
    }

    // Перевірка ресурсів
    const resources = await Resource.find({}).populate('author');
    console.log(`\n Ресурсів в базі: ${resources.length}`);
    
    if (resources.length > 0) {
      console.log('\n Список ресурсів:');
      resources.forEach(resource => {
        console.log(`   - "${resource.title}" (${resource.category}) - ${resource.isActive ? 'активний' : 'неактивний'}${resource.isApproved ? ' - схвалено' : ' - на модерації'}`);
        console.log(`     Автор: ${resource.author ? resource.author.email : 'невідомо'}`);
      });
    } else {
      console.log(' Ресурсів не знайдено');
    }

    // Статистика
    const adminUsers = await User.find({ role: 'admin' });
    const activeUsers = await User.find({ isActive: true });
    const verifiedUsers = await User.find({ emailVerified: true });
    const approvedResources = await Resource.find({ isApproved: true, isActive: true });
    const pendingResources = await Resource.find({ isApproved: false, isActive: true });

    console.log('\n Статистика:');
    console.log(`   Адміністраторів: ${adminUsers.length}`);
    console.log(`   Активних користувачів: ${activeUsers.length}`);
    console.log(`   Верифікованих користувачів: ${verifiedUsers.length}`);
    console.log(`   Схвалених ресурсів: ${approvedResources.length}`);
    console.log(`   Ресурсів на модерації: ${pendingResources.length}`);

    // Відключення від БД
    await mongoose.disconnect();
    console.log('\n Відключено від MongoDB');
    
  } catch (error) {
    console.error('Помилка:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Запуск скрипту
checkData();
