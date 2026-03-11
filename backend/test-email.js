require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('=== Testing Email Configuration ===\n');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  console.log('\n');

  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true,
      logger: true
    });

    console.log('Testing SMTP connection...\n');
    await transporter.verify();
    console.log('SMTP connection successful!\n');

    const testEmailAddress = process.argv[2] || process.env.EMAIL_USER;
    console.log(`Sending test email to: ${testEmailAddress}\n`);

    const info = await transporter.sendMail({
      from: `"Resource Center Test" <${process.env.EMAIL_USER}>`,
      to: testEmailAddress,
      subject: 'Test Email - Resource Center',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;"> Email Configuration Test</h2>
          <p>This is a test email from Resource Center.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    console.log(' Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox (and spam folder) for the test email.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing email:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) console.error('SMTP response:', error.response);
    process.exit(1);
  }
};

testEmail();
