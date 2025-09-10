const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Account = require('../models/Account');

// Dummy Teacher Data
const dummyTeachers = [
  {
    name: "Dr. Rajesh Kumar",
    email: "23101@iiitu.ac.in",
    teacherId: "TCH2024001",
    employeeId: "EMP001",
    department: "Computer Science",
    designation: "Professor",
    qualification: "Ph.D. in Computer Science",
    specialization: ["Machine Learning", "Data Structures", "Algorithms"],
    experience: 15,
    phone: "9876543210",
    address: {
      street: "123 Faculty Quarters, Sector 15",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India"
    },
    dateOfBirth: new Date("1975-05-15"),
    gender: "Male",
    bloodGroup: "B+",
    joiningDate: new Date("2010-08-01"),
    salary: 120000,
    workHours: 8,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Dr. Priya Sharma",
    email: "23102@iiitu.ac.in",
    teacherId: "TCH2024002",
    employeeId: "EMP002",
    department: "Information Technology",
    designation: "Associate Professor",
    qualification: "Ph.D. in Information Technology",
    specialization: ["Web Development", "Database Systems", "Software Engineering"],
    experience: 12,
    phone: "9876543211",
    address: {
      street: "456 Faculty Quarters, Salt Lake",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
      country: "India"
    },
    dateOfBirth: new Date("1980-08-22"),
    gender: "Female",
    bloodGroup: "A+",
    joiningDate: new Date("2012-07-01"),
    salary: 100000,
    workHours: 8,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Dr. Arjun Singh",
    email: "23103@iiitu.ac.in",
    teacherId: "TCH2024003",
    employeeId: "EMP003",
    department: "Mechanical Engineering",
    designation: "Assistant Professor",
    qualification: "M.Tech in Mechanical Engineering",
    specialization: ["Thermodynamics", "Machine Design", "CAD/CAM"],
    experience: 8,
    phone: "9876543212",
    address: {
      street: "789 Faculty Quarters, Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    dateOfBirth: new Date("1985-12-10"),
    gender: "Male",
    bloodGroup: "O+",
    joiningDate: new Date("2016-06-01"),
    salary: 80000,
    workHours: 8,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

// Dummy Admin Data
const dummyAdmins = [
  {
    name: "Dr. Suresh Kumar",
    email: "23151@iiitu.ac.in",
    adminId: "ADM2024001",
    employeeId: "ADM001",
    role: "Super Admin",
    permissions: {
      studentManagement: true,
      teacherManagement: true,
      adminManagement: true,
      accountManagement: true,
      systemSettings: true,
      reports: true
    },
    department: "Administration",
    designation: "Director",
    phone: "9876543213",
    address: {
      street: "321 Admin Block, Sector 15",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India"
    },
    dateOfBirth: new Date("1970-03-18"),
    gender: "Male",
    bloodGroup: "AB+",
    joiningDate: new Date("2008-01-01"),
    salary: 150000,
    workHours: 8,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Ms. Geeta Patel",
    email: "23152@iiitu.ac.in",
    adminId: "ADM2024002",
    employeeId: "ADM002",
    role: "Admin",
    permissions: {
      studentManagement: true,
      teacherManagement: false,
      adminManagement: false,
      accountManagement: true,
      systemSettings: false,
      reports: true
    },
    department: "Student Affairs",
    designation: "Student Affairs Officer",
    phone: "9876543214",
    address: {
      street: "654 Admin Block, Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      country: "India"
    },
    dateOfBirth: new Date("1982-07-25"),
    gender: "Female",
    bloodGroup: "B-",
    joiningDate: new Date("2015-03-01"),
    salary: 70000,
    workHours: 8,
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

// Dummy Account Data
const dummyAccounts = [
  {
    accountNumber: "ACC001234567890",
    accountHolderId: new mongoose.Types.ObjectId(), // Will be updated with actual student ID
    accountHolderType: "Student",
    accountType: "Savings",
    bankName: "State Bank of India",
    branchName: "IIITU Branch",
    ifscCode: "SBIN0001234",
    currentBalance: 5000,
    minimumBalance: 1000,
    interestRate: 4.5,
    accountStatus: "Active",
    isPrimary: true,
    dailyTransactionLimit: 50000,
    monthlyTransactionLimit: 200000,
    openingDate: new Date("2023-08-01"),
    kycStatus: "Verified",
    kycDocuments: [
      {
        documentType: "Aadhaar",
        documentNumber: "123456789012",
        uploadedDate: new Date("2023-07-25"),
        verifiedDate: new Date("2023-07-26")
      }
    ],
    contactInfo: {
      phone: "9876543210",
      email: "23114@iiitu.ac.in",
      address: {
        street: "123 MG Road, Sector 15",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India"
      }
    },
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    accountNumber: "ACC001234567891",
    accountHolderId: new mongoose.Types.ObjectId(), // Will be updated with actual teacher ID
    accountHolderType: "Teacher",
    accountType: "Current",
    bankName: "HDFC Bank",
    branchName: "IIITU Branch",
    ifscCode: "HDFC0001234",
    currentBalance: 25000,
    minimumBalance: 5000,
    interestRate: 3.5,
    accountStatus: "Active",
    isPrimary: true,
    dailyTransactionLimit: 100000,
    monthlyTransactionLimit: 500000,
    openingDate: new Date("2010-08-01"),
    kycStatus: "Verified",
    kycDocuments: [
      {
        documentType: "PAN",
        documentNumber: "ABCDE1234F",
        uploadedDate: new Date("2010-07-25"),
        verifiedDate: new Date("2010-07-26")
      }
    ],
    contactInfo: {
      phone: "9876543210",
      email: "23101@iiitu.ac.in",
      address: {
        street: "123 Faculty Quarters, Sector 15",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India"
      }
    },
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

// Function to insert all dummy data
const insertAllDummyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Insert Teachers
    console.log('Inserting teachers...');
    const insertedTeachers = await Teacher.insertMany(dummyTeachers);
    console.log(`✅ Inserted ${insertedTeachers.length} teachers`);

    // Insert Admins
    console.log('Inserting admins...');
    const insertedAdmins = await Admin.insertMany(dummyAdmins);
    console.log(`✅ Inserted ${insertedAdmins.length} admins`);

    // Insert Students (if not already inserted)
    console.log('Checking for existing students...');
    const existingStudents = await Student.find();
    if (existingStudents.length === 0) {
      console.log('No students found, inserting dummy students...');
      const { insertDummyData } = require('./dummyStudents');
      await insertDummyData();
    } else {
      console.log(`Found ${existingStudents.length} existing students`);
    }

    // Update account data with actual IDs
    const students = await Student.find().limit(1);
    const teachers = await Teacher.find().limit(1);
    const admins = await Admin.find().limit(1);

    if (students.length > 0) {
      dummyAccounts[0].accountHolderId = students[0]._id;
      dummyAccounts[0].contactInfo.email = students[0].email;
    }

    if (teachers.length > 0) {
      dummyAccounts[1].accountHolderId = teachers[0]._id;
      dummyAccounts[1].contactInfo.email = teachers[0].email;
    }

    // Insert Accounts
    console.log('Inserting accounts...');
    const insertedAccounts = await Account.insertMany(dummyAccounts);
    console.log(`✅ Inserted ${insertedAccounts.length} accounts`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`👨‍🎓 Students: ${await Student.countDocuments()}`);
    console.log(`👨‍🏫 Teachers: ${await Teacher.countDocuments()}`);
    console.log(`👨‍💼 Admins: ${await Admin.countDocuments()}`);
    console.log(`🏦 Accounts: ${await Account.countDocuments()}`);

  } catch (error) {
    console.error('Error inserting dummy data:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the function if this file is executed directly
if (require.main === module) {
  insertAllDummyData();
}

module.exports = { 
  dummyTeachers, 
  dummyAdmins, 
  dummyAccounts, 
  insertAllDummyData 
};
