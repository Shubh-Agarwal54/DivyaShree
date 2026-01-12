require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { verifyEmailConnection } = require('./services/notification.service');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Verify email configuration on startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  verifyEmailConnection();
} else {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASSWORD not configured. Email features will not work.');
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});
