#!/usr/bin/env node

/**
 * Test script to verify email configuration
 * Usage: node scripts/testEmail.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

const testEmail = async () => {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Host:', process.env.EMAIL_HOST);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('✅ Transporter created successfully');

    // Verify configuration
    console.log('🔍 Verifying email configuration...');
    await transporter.verify();
    console.log('✅ Email configuration verified successfully!');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'IIITU Student Portal - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">✅ Email Configuration Test</h2>
          <p>If you receive this email, your email configuration is working correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Check your inbox for the test email.');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting Gmail Authentication:');
      console.log('1. Make sure you have enabled 2-Factor Authentication on your Gmail account');
      console.log('2. Generate an App Password:');
      console.log('   - Go to Google Account settings');
      console.log('   - Security → 2-Step Verification → App passwords');
      console.log('   - Generate a new app password for "Mail"');
      console.log('   - Use the 16-character password (without spaces)');
      console.log('3. Update your config.env file with the correct app password');
    }
  }
};

testEmail();
