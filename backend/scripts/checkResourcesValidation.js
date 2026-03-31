const mongoose = require('mongoose');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

/**
 * Скрипт для перевірки валідації ресурсів
 */
const checkResourcesValidation = async () => {
  try {
    // Підключення до MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
    
    await mongoose.connect(MONGODB_URI);
    console.log(' Підключено до MongoDB');

    // Знаходимо всі ресурси
    const allResources = await Resource.find({});
    console.log(`\n Перевірка валідації для ${allResources.length} ресурсів:`);

    let problematicResources = [];
    
    for (const resource of allResources) {
      const issues = [];
      
      // Перевіряємо обов'язкові поля
      if (!resource.title || resource.title.trim().length === 0) {
        issues.push('назва відсутня');
      }
      
      if (!resource.description || resource.description.trim().length < 10) {
        issues.push('опис занадто короткий');
      }
      
      if (!resource.url || resource.url.trim().length === 0) {
        issues.push('URL відсутній');
      }
      
      if (!resource.category) {
        issues.push('категорія відсутня');
      }
      
      if (!resource.author) {
        issues.push('автор відсутній');
      }
      
      if (issues.length > 0) {
        problematicResources.push({
          title: resource.title || 'Без назви',
          issues: issues,
          currentData: {
            title: resource.title,
            description: resource.description ? `${resource.description.substring(0, 50)}...` : 'відсутній',
            url: resource.url || 'відсутній',
            category: resource.category || 'відсутня',
            author: resource.author || 'відсутній'
          }
        });
      }
    }

    console.log(`\n Знайдено ${problematicResources.length} проблемних ресурсів:`);

    if (problematicResources.length > 0) {
      problematicResources.forEach((resource, index) => {
        console.log(`\n ${index + 1}. "${resource.title}"`);
        console.log(`    Проблеми: ${resource.issues.join(', ')}`);
        console.log(`    Поточні дані:`);
        console.log(`      Назва: ${resource.currentData.title}`);
        console.log(`      Опис: ${resource.currentData.description}`);
        console.log(`      URL: ${resource.currentData.url}`);
        console.log(`      Категорія: ${resource.currentData.category}`);
        console.log(`      Автор: ${resource.currentData.author}`);
      });
    } else {
      console.log(' ✅ Всі ресурси пройшли валідацію!');
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
checkResourcesValidation();
