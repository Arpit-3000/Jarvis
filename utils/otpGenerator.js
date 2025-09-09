const crypto = require('crypto');
const config = require('../config/env');

/**
 * Generate a random OTP
 * @param {Number} length - Length of OTP (default from config)
 * @returns {String} - Generated OTP
 */
const generateOTP = (length = config.OTP_LENGTH) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Generate OTP expiration time
 * @returns {Date} - Expiration date
 */
const getOTPExpirationTime = () => {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + (config.OTP_EXPIRE_MINUTES * 60 * 1000));
  return expirationTime;
};

/**
 * Check if OTP is expired
 * @param {Date} expirationTime - OTP expiration time
 * @returns {Boolean} - True if expired
 */
const isOTPExpired = (expirationTime) => {
  return new Date() > new Date(expirationTime);
};

/**
 * Generate a secure random string for verification
 * @param {Number} length - Length of string
 * @returns {String} - Random string
 */
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = {
  generateOTP,
  getOTPExpirationTime,
  isOTPExpired,
  generateSecureString
};
