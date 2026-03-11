const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center-katerina');
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('-password');
    
    console.log(`\nTotal users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Verified: ${user.emailVerified}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listUsers();
