const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config/env');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');
const accountRoutes = require('./routes/account');
const leaveFormRoutes = require('./routes/leaveForm');
const nonTeachingStaffRoutes = require('./routes/nonTeachingStaff');
const gateRoutes = require('./routes/gateRoutes');
const { startCleanupScheduler } = require('./utils/cleanupScheduler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/leave-form', leaveFormRoutes);
app.use('/api/non-teaching', nonTeachingStaffRoutes);
app.use('/api/gate', gateRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Student Portal Backend API',
    version: '1.0.0',
    environment: config.NODE_ENV
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    ...(config.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  // Start the cleanup scheduler
  startCleanupScheduler();
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log(`💡 Solutions:`);
    console.log(`   1. Run: npm run kill-port`);
    console.log(`   2. Run: npm run start:clean`);
    console.log(`   3. Or use a different port: PORT=5001 npm start`);
    console.log(`   4. Or kill the process manually:`);
    console.log(`      netstat -ano | findstr :${PORT}`);
    console.log(`      taskkill /PID <PID> /F`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});