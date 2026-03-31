const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
 
/**
 * Скрипт для перевірки та відновлення даних користувача
 */
async function checkAndRestoreUser() {
  try {
    // Підключення до MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center');
    console.log('MongoDB підключено');
 
    // 1. Перевіряємо існуючих користувачів
    const users = await User.find({});
    console.log(`\nЗнайдено користувачів: ${users.length}`);
 
    if (users.length === 0) {
      console.log('Користувачів не знайдено. Створюємо нового...');
      await createTestUser();
      return;
    }
 
    // 2. Показуємо інформацію про всіх користувачів
    users.forEach((user, index) => {
      console.log(`\n--- Користувач ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Ім'я: ${user.firstName} ${user.lastName}`);
      console.log(`Роль: ${user.role}`);
      console.log(`Активний: ${user.isActive}`);
      console.log(`Email верифікований: ${user.emailVerified}`);
      console.log(`Створено: ${user.createdAt}`);
    });
 
    // 3. Створюємо нового користувача для тестування
    console.log('\nСтворюємо тестового користувача "admin@test.com" з паролем "admin123"...');
    await createTestUser();
 
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}
 
/**
 * Створює тестового користувача
 */
async function createTestUser() {
  try {
    // Перевіряємо чи існує admin@test.com
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
 
    if (existingAdmin) {
      console.log('Користувач admin@test.com вже існує');
      console.log('Ви можете увійти з:');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      return;
    }
 
    // Створюємо нового адміна
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
 
    await adminUser.save();
    console.log('Тестового користувача створено успішно!');
    console.log('\nДані для входу:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    console.log('\nЦей користувач має права адміністратора і верифікований email.');
 
  } catch (error) {
    console.error('Помилка створення користувача:', error);
  }
}
 
/**
 * Скидає пароль для існуючого користувача
 */
async function resetPassword(email, newPassword) {
  try {
    const user = await User.findOne({ email });
 
    if (!user) {
      console.log(`Користувача з email ${email} не знайдено`);
      return;
    }
 
    user.password = newPassword;
    await user.save();
 
    console.log(`Пароль для користувача ${email} скинуто на: ${newPassword}`);
    console.log('Тепер ви можете увійти з новим паролем.');
 
  } catch (error) {
    console.error('Помилка скидання паролю:', error);
  }
}
 
// Запуск скрипту
if (process.argv.length > 2) {
  const command = process.argv[2];
 
  if (command === 'reset' && process.argv.length === 4) {
    const email = process.argv[3];
    resetPassword(email, 'newpassword123');
  } else if (command === 'reset' && process.argv.length === 5) {
    const email = process.argv[3];
    const newPassword = process.argv[4];
    resetPassword(email, newPassword);
  } else {
    console.log('Використання:');
    console.log('node checkUser.js - перевірити всіх користувачів');
    console.log('node checkUser.js reset email - скинути пароль на "newpassword123"');
    console.log('node checkUser.js reset email newpassword - скинути пароль на вказаний');
  }
} else {
  checkAndRestoreUser();
}