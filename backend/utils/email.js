const nodemailer = require('nodemailer');

/**
 * Створює налаштований transporter для відправки email
 * @returns {Object} - Налаштований nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Генерує базовий HTML шаблон для email
 * @param {string} title - Заголовок email
 * @param {string} content - Основний контент
 * @param {string} buttonText - Текст кнопки
 * @param {string} buttonUrl - URL кнопки
 * @param {string} buttonColor - Колір кнопки
 * @returns {string} - HTML шаблон
 */
const generateEmailTemplate = (title, content, buttonText, buttonUrl, buttonColor) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <p>${content}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${buttonUrl}" 
           style="background-color: ${buttonColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          ${buttonText}
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: ${buttonColor};">${buttonUrl}</p>
    </div>
  `;
};

/**
 * Відправляє email для верифікації
 * @param {string} email - Email отримувача
 * @param {string} token - Токен верифікації
 */
const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    const mailOptions = {
      from: `"Resource Center" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Resource Center',
      html: generateEmailTemplate(
        'Welcome to Resource Center!',
        'Thank you for registering with us. Please click the button below to verify your email address.',
        'Verify Email',
        verificationUrl,
        '#007bff'
      ) + `
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Відправляє email для скидання паролю
 * @param {string} email - Email отримувача
 * @param {string} token - Токен скидання паролю
 */
const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"Resource Center" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - Resource Center',
      html: generateEmailTemplate(
        'Password Reset Request',
        'You requested a password reset for your Resource Center account. Click the button below to reset your password:',
        'Reset Password',
        resetUrl,
        '#dc3545'
      ) + `
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
