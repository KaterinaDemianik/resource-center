const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Скрипт для видалення всіх користувачів окрім адміністраторів
 */
const deleteNonAdminUsers = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо всіх адміністраторів
    const admins = await User.find({ role: 'admin' });
    console.log(`Знайдено адміністраторів: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });

    // Знаходимо всіх не-адміністраторів
    const nonAdmins = await User.find({ role: { $ne: 'admin' } });
    console.log(`\nЗнайдено звичайних користувачів: ${nonAdmins.length}`);

    if (nonAdmins.length === 0) {
      console.log('Немає користувачів для видалення');
      await mongoose.disconnect();
      return;
    }

    // Виводимо список користувачів, які будуть видалені
    console.log('\n Користувачі, які будуть видалені:');
    nonAdmins.forEach(user => {
      console.log(`   - ${user.email} (${user.firstName} ${user.lastName})`);
    });

    // Видаляємо всіх не-адміністраторів
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    
    console.log(`\nУспішно видалено ${result.deletedCount} користувачів`);
    console.log(`Адміністратори збережені: ${admins.length}`);

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
deleteNonAdminUsers();
