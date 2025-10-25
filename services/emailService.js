const nodemailer = require('nodemailer');
const config = require('../config/env');

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL_HOST || 'smtp.gmail.com',
    port: config.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    },
    connectionTimeout: 1000000, // 10 seconds
    greetingTimeout: 1000000,   // 10 seconds
    socketTimeout: 3000000      // 30 seconds
  });
};

/**
 * Send OTP email
 * @param {String} email - Recipient email
 * @param {String} otp - OTP code
 * @param {String} studentName - Student name
 * @returns {Promise<Boolean>} - Success status
 */
const sendOTPEmail = async (email, otp, studentName) => {
  try {
    console.log('Creating email transporter...');
    console.log('Config values:', {
      EMAIL_USER: config.EMAIL_USER,
      EMAIL_PASS: config.EMAIL_PASS ? '***' : 'undefined',
      EMAIL_FROM: config.EMAIL_FROM
    });
    const transporter = createTransporter();

    // Verify transporter configuration
    console.log('Verifying transporter configuration...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'IIITU Student Portal - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">IIITU Student Portal</h2>
            <h3 style="color: #34495e;">OTP Verification</h3>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 10px; margin-top: 20px;">
            <p style="font-size: 16px; color: #2c3e50;">Hello ${studentName},</p>
            
            <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6;">
              You have requested to sign in to the IIITU Student Portal. Please use the following OTP to complete your authentication:
            </p>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #e74c3c; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            
            <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6;">
              This OTP is valid for <strong>${config.OTP_EXPIRE_MINUTES} minutes</strong> and can only be used once.
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="font-size: 13px; color: #856404; margin: 0;">
                <strong>Security Notice:</strong> If you did not request this OTP, please ignore this email. 
                Do not share this OTP with anyone.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="font-size: 12px; color: #95a5a6; margin: 0;">
              This is an automated message from IIITU Student Portal. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    console.log('Sending email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error details:', {
      code: error.code,
      response: error.response,
      command: error.command
    });
    return false;
  }
};

/**
 * Send welcome email after successful verification
 * @param {String} email - Recipient email
 * @param {String} studentName - Student name
 * @returns {Promise<Boolean>} - Success status
 */
const sendWelcomeEmail = async (email, studentName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.EMAIL_FROM,
      to: email,
      subject: 'Welcome to IIITU Student Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #27ae60; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin-bottom: 20px;">Welcome to IIITU Student Portal</h2>
          </div>
          
          <div style="padding: 20px; background-color: white; border-radius: 10px; margin-top: 20px;">
            <p style="font-size: 16px; color: #2c3e50;">Hello ${studentName},</p>
            
            <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6;">
              Welcome to the IIITU Student Portal! You have successfully verified your email and can now access your student account.
            </p>
            
            <div style="background-color: #d5f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="font-size: 14px; color: #27ae60; margin: 0;">
                <strong>Your account is now active!</strong> You can access all the features of the student portal.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6;">
              If you have any questions or need assistance, please contact the administration.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="font-size: 12px; color: #95a5a6; margin: 0;">
              IIITU Student Portal - Empowering Education
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
