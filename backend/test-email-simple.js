require('dotenv').config();
const { sendVerificationEmail } = require('./utils/email');

const testEmail = async () => {
  const testEmailAddress = process.argv[2] || 'k.demianik12@gmail.com';
  const testToken = 'test-token-123';

  console.log('=== Testing Email Send ===\n');
  console.log('Sending verification email to:', testEmailAddress);
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS configured:', process.env.EMAIL_PASS ? 'YES' : 'NO');
  console.log('\n');

  try {
    await sendVerificationEmail(testEmailAddress, testToken);
    console.log('\nEmail sent successfully!');
    console.log('Check your inbox (and spam folder).');
    process.exit(0);
  } catch (error) {
    console.error('\nError sending email:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

testEmail();
