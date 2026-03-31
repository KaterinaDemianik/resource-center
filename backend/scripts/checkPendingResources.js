const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для детальної перевірки ресурсів на модерації
 */
const checkPendingResources = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо ресурси на модерації
    const pendingResources = await Resource.find({ isApproved: false }).populate('author');
    
    console.log(`\n Ресурсів на модерації (isApproved: false): ${pendingResources.length}\n`);

    if (pendingResources.length > 0) {
      pendingResources.forEach((resource, index) => {
        console.log(`${index + 1}. "${resource.title}"`);
        console.log(`   isActive: ${resource.isActive}`);
        console.log(`   isApproved: ${resource.isApproved}`);
        console.log(`   Автор: ${resource.author ? resource.author.email : 'невідомо'}`);
        console.log(`   Дата створення: ${resource.createdAt}`);
        console.log('');
      });
    } else {
      console.log(' Всі ресурси схвалені!');
    }

    await mongoose.disconnect();
    console.log(' Відключено від MongoDB');
    
  } catch (error) {
    console.error(' Помилка:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

checkPendingResources();
