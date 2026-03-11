const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const deleteUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center-katerina');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      process.exit(1);
    }

    console.log('Found user:', user.firstName, user.lastName);
    console.log('Email:', user.email);
    console.log('\nDeleting user...');

    await User.deleteOne({ email });

    console.log(' User deleted successfully!');
    console.log('You can now register with this email again.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node delete-user.js <email>');
  process.exit(1);
}

deleteUser(email);
