const mongoose = require('mongoose');
require('dotenv').config();

const Resource = require('./models/Resource');
const User = require('./models/User');

const seedResources = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center-katerina');
    console.log('Connected to MongoDB');

    // Get first user (or create one if none exists)
    let user = await User.findOne();
    if (!user) {
      user = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        emailVerified: true,
        isActive: true,
        role: 'admin'
      });
      await user.save();
      console.log('Created admin user');
    }

    // Clear existing resources
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Sample resources
    const sampleResources = [
      {
        title: 'Вступ до React Hooks',
        description: 'Комплексний посібник з використання React Hooks для створення сучасних веб-додатків. Охоплює useState, useEffect, useContext та інші важливі хуки.',
        category: 'technology',
        tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
        url: 'https://reactjs.org/docs/hooks-intro.html',
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Онлайн курси програмування',
        description: 'Платформа з безкоштовними курсами програмування для початківців та досвідчених розробників. Включає Python, JavaScript, Java та інші мови.',
        category: 'education',
        tags: ['Програмування', 'Онлайн', 'Курси', 'Python', 'JavaScript'],
        url: 'https://www.coursera.org/',
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Психологічне здоров\'я студентів',
        description: 'Поради та ресурси для підтримки психічного здоров\'я під час навчання. Техніки зменшення стресу, тайм-менеджмент та баланс роботи і відпочинку.',
        category: 'health',
        tags: ['Здоров\'я', 'Психологія', 'Студенти', 'Стрес'],
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Стартап бізнес-план',
        description: 'Детальна інструкція зі створення бізнес-плану для стартапу. Фінансове планування, маркетингова стратегія та пошук інвесторів.',
        category: 'business',
        tags: ['Бізнес', 'Стартап', 'Планування', 'Інвестиції'],
        url: 'https://www.startups.com/',
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Інтерактивні освітні ігри',
        description: 'Колекція освітніх ігор для дітей та дорослих. Математика, наука, мови та логіка в ігровій формі.',
        category: 'entertainment',
        tags: ['Ігри', 'Освіта', 'Діти', 'Інтерактив'],
        url: 'https://www.khanacademy.org/',
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Node.js Best Practices',
        description: 'Найкращі практики розробки Node.js додатків. Структура проекту, безпека, продуктивність та тестування.',
        category: 'technology',
        tags: ['Node.js', 'Backend', 'JavaScript', 'Best Practices'],
        url: 'https://nodejs.org/en/docs/guides/',
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Дистанційне навчання поради',
        description: 'Ефективні стратегії для дистанційного навчання. Організація робочого місця, мотивація та комунікація з викладачами.',
        category: 'education',
        tags: ['Навчання', 'Онлайн', 'Поради', 'Продуктивність'],
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      },
      {
        title: 'Йога для офісних працівників',
        description: 'Прості вправи та пози йоги для зняття напруги під час роботи за комп\'ютером. Профілактика болю в спині та шиї.',
        category: 'health',
        tags: ['Йога', 'Здоров\'я', 'Офіс', 'Вправи'],
        author: user._id,
        isActive: true,
        isApproved: true,
        approvedBy: user._id,
        approvedAt: new Date()
      }
    ];

    // Insert resources
    const insertedResources = await Resource.insertMany(sampleResources);
    console.log(`${insertedResources.length} resources created successfully`);

    console.log('\nSample resources created:');
    insertedResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} (${resource.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding resources:', error);
    process.exit(1);
  }
};

seedResources();
