const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const verifyUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resource-center-katerina');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      process.exit(1);
    }

    console.log('User found:', user.firstName, user.lastName);
    console.log('Current status - emailVerified:', user.emailVerified, 'isActive:', user.isActive);

    user.emailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = null;
    await user.save();

    console.log('User email verified successfully!');
    console.log('Updated status - emailVerified:', user.emailVerified, 'isActive:', user.isActive);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const email = process.argv[2] || 'k.demianik12@gmail.com';
verifyUser(email);
