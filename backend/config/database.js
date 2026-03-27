const mongoose = require('mongoose');

/**
 * Конфігурація для підключення до MongoDB
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center';
const DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Максимальна кількість з'єднань
  serverSelectionTimeoutMS: 5000, // Таймаут вибору сервера
  socketTimeoutMS: 45000, // Таймаут сокета
  bufferCommands: false, // Вимкнути буферизацію команд
};

/**
 * Підключення до бази даних MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, DB_OPTIONS);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Обробка подій з'єднання
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
