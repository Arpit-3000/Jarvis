const dotenv = require('dotenv');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// Debug check
console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET);

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/student_portal',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',

  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'IIITU Student Portal <noreply@iiitu.ac.in>',

  // OTP Configuration
  OTP_EXPIRE_MINUTES: process.env.OTP_EXPIRE_MINUTES || 10,
  OTP_LENGTH: process.env.OTP_LENGTH || 6,

  // Gate System Configuration
  QR_EXPIRE_MINUTES: process.env.QR_EXPIRE_MINUTES || 10
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASS'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = config;
