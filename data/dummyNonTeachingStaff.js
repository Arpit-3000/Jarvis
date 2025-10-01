const mongoose = require('mongoose');
const NonTeachingStaff = require('../models/NonTeachingStaff');
const Admin = require('../models/Admin');
const config = require('../config/env');

// Sample non-teaching staff data
const nonTeachingStaffData = [
  {
    name: "Rajesh Kumar",
    email: "101@iiitu.ac.in",
    staffId: "AD101",
    designation: "Hostel Warden",
    department: "Hostel Administration",
    role: "Hostel Warden",
    phone: "9876543213",
    address: {
      street: "456 Hostel Complex",
      city: "Una",
      state: "Himachal Pradesh",
      pincode: "174303",
      country: "India"
    },
    dateOfBirth: new Date("1980-03-15"),
    gender: "Male",
    bloodGroup: "A+",
    joiningDate: new Date("2020-01-15"),
    salary: 45000,
    workHours: 8,
    permissions: {
      canApproveLeave: true,
      canRejectLeave: true,
      canViewAllLeaves: true,
      canViewStudentDetails: true
    },
    isActive: true
  },
  {
    name: "Priya Sharma",
    email: "102@iiitu.ac.in",
    staffId: "GD101",
    designation: "Security Head",
    department: "Security",
    role: "Security Head",
    phone: "9876543214",
    address: {
      street: "789 Security Quarters",
      city: "Una",
      state: "Himachal Pradesh",
      pincode: "174303",
      country: "India"
    },
    dateOfBirth: new Date("1985-07-22"),
    gender: "Female",
    bloodGroup: "O+",
    joiningDate: new Date("2019-06-01"),
    salary: 42000,
    workHours: 8,
    permissions: {
      canApproveLeave: true,
      canRejectLeave: true,
      canViewAllLeaves: true,
      canViewStudentDetails: true
    },
    isActive: true
  },
  {
    name: "Amit Singh",
    email: "103@iiitu.ac.in",
    staffId: "AT101",
    designation: "Attendant",
    department: "Hostel Administration",
    role: "Attendant",
    phone: "9876543215",
    address: {
      street: "321 Staff Quarters",
      city: "Una",
      state: "Himachal Pradesh",
      pincode: "174303",
      country: "India"
    },
    dateOfBirth: new Date("1988-12-10"),
    gender: "Male",
    bloodGroup: "A+",
    joiningDate: new Date("2021-03-01"),
    salary: 25000,
    workHours: 8,
    permissions: {
      canApproveLeave: true,
      canRejectLeave: true,
      canViewAllLeaves: true,
      canViewStudentDetails: true
    },
    isActive: true
  },
  {
    name: "Sunita Devi",
    email: "104@iiitu.ac.in",
    staffId: "GR101",
    designation: "Security Guard",
    department: "Security",
    role: "Security Guard",
    phone: "9876543216",
    address: {
      street: "654 Security Quarters",
      city: "Una",
      state: "Himachal Pradesh",
      pincode: "174303",
      country: "India"
    },
    dateOfBirth: new Date("1982-08-25"),
    gender: "Female",
    bloodGroup: "B+",
    joiningDate: new Date("2020-07-15"),
    salary: 22000,
    workHours: 8,
    permissions: {
      canApproveLeave: true,
      canRejectLeave: true,
      canViewAllLeaves: true,
      canViewStudentDetails: true
    },
    isActive: true
  }
];

// Function to insert non-teaching staff data
const insertNonTeachingStaffData = async () => {
  try {
    console.log('Starting non-teaching staff data insertion...');

    // Get the first admin to use as createdBy
    const admin = await Admin.findOne().select('_id');
    if (!admin) {
      console.error('No admin found. Please create an admin first.');
      return;
    }

    // Clear existing non-teaching staff data
    await NonTeachingStaff.deleteMany({});
    console.log('Cleared existing non-teaching staff data');

    // Insert new non-teaching staff data
    const staffWithCreatedBy = nonTeachingStaffData.map(staff => ({
      ...staff,
      createdBy: admin._id
    }));

    const insertedStaff = await NonTeachingStaff.insertMany(staffWithCreatedBy);
    console.log(`Successfully inserted ${insertedStaff.length} non-teaching staff members`);

    // Display inserted data
    insertedStaff.forEach((staff, index) => {
      console.log(`\n--- Staff ${index + 1} ---`);
      console.log(`Name: ${staff.name}`);
      console.log(`Email: ${staff.email}`);
      console.log(`Staff ID: ${staff.staffId}`);
      console.log(`Designation: ${staff.designation}`);
      console.log(`Department: ${staff.department}`);
      console.log(`Role: ${staff.role}`);
      console.log(`Phone: ${staff.phone}`);
      console.log(`Address: ${staff.address.street}, ${staff.address.city}, ${staff.address.state} - ${staff.address.pincode}`);
      console.log(`Date of Birth: ${staff.dateOfBirth.toDateString()}`);
      console.log(`Gender: ${staff.gender}`);
      console.log(`Blood Group: ${staff.bloodGroup}`);
      console.log(`Joining Date: ${staff.joiningDate.toDateString()}`);
      console.log(`Salary: ₹${staff.salary}`);
      console.log(`Work Hours: ${staff.workHours} hours`);
      console.log(`Permissions:`, staff.permissions);
      console.log(`Active: ${staff.isActive}`);
      console.log(`Created At: ${staff.createdAt}`);
    });

    console.log('\n✅ Non-teaching staff data insertion completed successfully!');
    console.log('\n📋 Login Credentials for Testing:');
    console.log('Staff 1 (AD101) - Hostel Warden:');
    console.log('  Email: 101@iiitu.ac.in');
    console.log('  Staff ID: AD101');
    console.log('  Job Role: Hostel Warden');
    console.log('  Login Role: nonteaching');
    console.log('\nStaff 2 (GD101) - Security Head:');
    console.log('  Email: 102@iiitu.ac.in');
    console.log('  Staff ID: GD101');
    console.log('  Job Role: Security Head');
    console.log('  Login Role: nonteaching');
    console.log('\nStaff 3 (AT101) - Attendant:');
    console.log('  Email: 103@iiitu.ac.in');
    console.log('  Staff ID: AT101');
    console.log('  Job Role: Attendant');
    console.log('  Login Role: nonteaching');
    console.log('\nStaff 4 (GR101) - Security Guard:');
    console.log('  Email: 104@iiitu.ac.in');
    console.log('  Staff ID: GR101');
    console.log('  Job Role: Security Guard');
    console.log('  Login Role: nonteaching');

  } catch (error) {
    console.error('Error inserting non-teaching staff data:', error);
  }
};

// Run the insertion if this file is executed directly
if (require.main === module) {
  // Connect to database
  const connectDB = require('../config/database');
  connectDB().then(() => {
    insertNonTeachingStaffData().then(() => {
      process.exit(0);
    });
  });
}

module.exports = { insertNonTeachingStaffData, nonTeachingStaffData };
