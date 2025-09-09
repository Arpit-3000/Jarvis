const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import the Student model
const Student = require('../models/Student');

// Dummy student data
const dummyStudents = [
  {
    name: "Rajesh Kumar",
    email: "23114@iiitu.ac.in",
    studentId: "STU2024001",
    rollNumber: "23114",
    department: "Computer Science",
    branch: "Computer Science and Engineering",
    course: "Bachelor of Technology",
    year: "3rd",
    currentSemester: "5th",
    phone: "9876543210",
    address: {
      street: "123 MG Road, Sector 15",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      country: "India"
    },
    fatherName: "Suresh Kumar",
    motherName: "Sunita Kumar",
    fatherPhone: "9876543211",
    motherPhone: "9876543212",
    dateOfBirth: new Date("2003-05-15"),
    gender: "Male",
    bloodGroup: "B+",
    isActive: true,
    createdBy: new mongoose.Types.ObjectId() // You'll need to replace this with actual admin ID
  },
  {
    name: "Priya Sharma",
    email: "23115@iiitu.ac.in",
    studentId: "STU2024002",
    rollNumber: "23115",
    department: "Information Technology",
    branch: "Information Technology",
    course: "Bachelor of Technology",
    year: "2nd",
    currentSemester: "3rd",
    phone: "9876543213",
    address: {
      street: "456 Park Street, Salt Lake",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
      country: "India"
    },
    fatherName: "Amit Sharma",
    motherName: "Rekha Sharma",
    fatherPhone: "9876543214",
    motherPhone: "9876543215",
    dateOfBirth: new Date("2004-08-22"),
    gender: "Female",
    bloodGroup: "A+",
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Arjun Singh",
    email: "23116@iiitu.ac.in",
    studentId: "STU2024003",
    rollNumber: "23116",
    department: "Mechanical Engineering",
    branch: "Mechanical Engineering",
    course: "Bachelor of Technology",
    year: "4th",
    currentSemester: "7th",
    phone: "9876543216",
    address: {
      street: "789 Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    fatherName: "Vikram Singh",
    motherName: "Kavita Singh",
    fatherPhone: "9876543217",
    motherPhone: "9876543218",
    dateOfBirth: new Date("2002-12-10"),
    gender: "Male",
    bloodGroup: "O+",
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Sneha Patel",
    email: "23117@iiitu.ac.in",
    studentId: "STU2024004",
    rollNumber: "23117",
    department: "Electronics and Communication",
    branch: "Electronics and Communication Engineering",
    course: "Bachelor of Technology",
    year: "1st",
    currentSemester: "1st",
    phone: "9876543219",
    address: {
      street: "321 C.G. Road, Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      country: "India"
    },
    fatherName: "Ramesh Patel",
    motherName: "Geeta Patel",
    fatherPhone: "9876543220",
    motherPhone: "9876543221",
    dateOfBirth: new Date("2005-03-18"),
    gender: "Female",
    bloodGroup: "AB+",
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  },
  {
    name: "Vikram Reddy",
    email: "23118@iiitu.ac.in",
    studentId: "STU2024005",
    rollNumber: "23118",
    department: "Civil Engineering",
    branch: "Civil Engineering",
    course: "Bachelor of Technology",
    year: "3rd",
    currentSemester: "6th",
    phone: "9876543222",
    address: {
      street: "654 Banjara Hills, Road No. 12",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
      country: "India"
    },
    fatherName: "Srinivas Reddy",
    motherName: "Lakshmi Reddy",
    fatherPhone: "9876543223",
    motherPhone: "9876543224",
    dateOfBirth: new Date("2003-07-25"),
    gender: "Male",
    bloodGroup: "B-",
    isActive: true,
    createdBy: new mongoose.Types.ObjectId()
  }
];

// Function to insert dummy data
const insertDummyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing students (optional - remove this if you want to keep existing data)
    // await Student.deleteMany({});
    // console.log('Cleared existing student data');

    // Insert dummy students
    const insertedStudents = await Student.insertMany(dummyStudents);
    console.log(`Successfully inserted ${insertedStudents.length} students`);

    // Display inserted students
    insertedStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} - ${student.email} - ${student.studentId}`);
    });

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
  insertDummyData();
}

module.exports = { dummyStudents, insertDummyData };
