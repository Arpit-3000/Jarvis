#!/usr/bin/env node

/**
 * Script to insert all dummy data directly into database
 * Usage: node scripts/insertAllData.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Account = require('../models/Account');

// Import dummy data
const { dummyStudents } = require('../data/dummyStudents');
const { dummyTeachers, dummyAdmins, dummyAccounts } = require('../data/dummyData');

const insertAllData = async () => {
  try {
    console.log('🚀 Starting database insertion...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Admin.deleteMany({});
    await Account.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert Students
    console.log('👨‍🎓 Inserting students...');
    const insertedStudents = await Student.insertMany(dummyStudents);
    console.log(`✅ Inserted ${insertedStudents.length} students`);

    // Insert Teachers
    console.log('👨‍🏫 Inserting teachers...');
    const insertedTeachers = await Teacher.insertMany(dummyTeachers);
    console.log(`✅ Inserted ${insertedTeachers.length} teachers`);

    // Insert Admins
    console.log('👨‍💼 Inserting admins...');
    const insertedAdmins = await Admin.insertMany(dummyAdmins);
    console.log(`✅ Inserted ${insertedAdmins.length} admins`);

    // Update account data with actual IDs
    console.log('🔗 Linking accounts to users...');
    const updatedAccounts = [...dummyAccounts];
    
    if (insertedStudents.length > 0) {
      updatedAccounts[0].accountHolderId = insertedStudents[0]._id;
      updatedAccounts[0].contactInfo.email = insertedStudents[0].email;
    }

    if (insertedTeachers.length > 0) {
      updatedAccounts[1].accountHolderId = insertedTeachers[0]._id;
      updatedAccounts[1].contactInfo.email = insertedTeachers[0].email;
    }

    // Insert Accounts
    console.log('🏦 Inserting accounts...');
    const insertedAccounts = await Account.insertMany(updatedAccounts);
    console.log(`✅ Inserted ${insertedAccounts.length} accounts`);

    // Display summary
    console.log('\n📊 Database Summary:');
    console.log(`👨‍🎓 Students: ${await Student.countDocuments()}`);
    console.log(`👨‍🏫 Teachers: ${await Teacher.countDocuments()}`);
    console.log(`👨‍💼 Admins: ${await Admin.countDocuments()}`);
    console.log(`🏦 Accounts: ${await Account.countDocuments()}`);

    console.log('\n🎉 All dummy data inserted successfully!');
    console.log('\n📧 Test emails for OTP:');
    insertedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.email} - ${student.name}`);
    });

  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the function
insertAllData();
