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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});