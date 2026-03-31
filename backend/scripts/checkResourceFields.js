const mongoose = require('mongoose');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для перевірки полів ресурсів
 */
const checkResourceFields = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Перевіряємо перші 5 ресурсів детально
    const resources = await Resource.find({}).limit(5);
    
    console.log(`\n Детальна перевірка полів:`);
    
    for (const resource of resources) {
      console.log(`\n Ресурс: "${resource.title}"`);
      console.log(`   isActive: ${resource.isActive} (тип: ${typeof resource.isActive})`);
      console.log(`   isApproved: ${resource.isApproved} (тип: ${typeof resource.isApproved})`);
      console.log(`   category: ${resource.category}`);
      console.log(`   author: ${resource.author}`);
      
      // Перевіряємо чи відповідає публічному фільтру
      const isPublic = resource.isActive === true && resource.isApproved === true;
      console.log(`   Відповідає публічному фільтру: ${isPublic}`);
    }

    // Рахуємо статистику
    const allResources = await Resource.find({});
    let activeCount = 0;
    let approvedCount = 0;
    let publicCount = 0;
    
    allResources.forEach(resource => {
      if (resource.isActive === true) activeCount++;
      if (resource.isApproved === true) approvedCount++;
      if (resource.isActive === true && resource.isApproved === true) publicCount++;
    });

    console.log(`\n Статистика по всіх ${allResources.length} ресурсах:`);
    console.log(`   Активних (isActive: true): ${activeCount}`);
    console.log(`   Схвалених (isApproved: true): ${approvedCount}`);
    console.log(`   Публічних (active + approved): ${publicCount}`);

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
checkResourceFields();
