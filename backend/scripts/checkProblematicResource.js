const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для перевірки проблемного ресурсу
 */
const checkProblematicResource = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо ресурси з невідомими авторами
    const resourcesWithUnknownAuthors = await Resource.find({}).populate('author');
    let resourcesToFix = [];
    
    resourcesWithUnknownAuthors.forEach(resource => {
      if (!resource.author || !resource.author.email) {
        resourcesToFix.push(resource);
      }
    });

    console.log(`\n Ресурси для перевірки: ${resourcesToFix.length}`);

    // Перевіряємо кожен ресурс
    for (const resource of resourcesToFix) {
      console.log(`\n Ресурс: "${resource.title}"`);
      console.log(`   Опис: "${resource.description}"`);
      console.log(`   Довжина опису: ${resource.description ? resource.description.length : 0}`);
      
      if (!resource.description || resource.description.length < 10) {
        console.log(`   ПРОБЛЕМА: Опис занадто короткий!`);
      }
      
      if (resource.description && resource.description.length >= 10) {
        console.log(`   Опис OK`);
      }
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
checkProblematicResource();
