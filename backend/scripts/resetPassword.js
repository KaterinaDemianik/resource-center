const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
 
/**
 * Скрипт для скидання паролю користувача
 * Використання: node resetPassword.js email [newPassword]
 */
async function resetUserPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3] || 'temp123';
 
    if (!email) {
      console.log('Використання:');
      console.log('node resetPassword.js user@example.com');
      console.log('node resetPassword.js user@example.com newpassword123');
      process.exit(1);
    }
 
    // Підключення до MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center');
    console.log('MongoDB підключено');
 
    // Пошук користувача
    const user = await User.findOne({ email });
 
    if (!user) {
      console.log(`Користувача з email "${email}" не знайдено`);
 
      // Показуємо існуючих користувачів
      const users = await User.find({});
      console.log('\nІснуючі користувачі:');
      users.forEach(u => {
        console.log(`- ${u.email} (${u.firstName} ${u.lastName})`);
      });
      return;
    }
 
    // Скидання паролю
    user.password = newPassword;
    await user.save();
 
    console.log(`Пароль для користувача "${email}" успішно скинуто!`);
    console.log(`Новий пароль: ${newPassword}`);
    console.log('\nТепер ви можете увійти в систему з цими даними.');
 
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}
 
resetUserPassword();
 