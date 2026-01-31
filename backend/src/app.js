const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');

// Routes
const userRoutes = require('./modules/user/user.routes');
const orderRoutes = require('./modules/order/order.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const productRoutes = require('./modules/product/product.routes');
const reviewRoutes = require('./modules/product/review.routes');

const app = express();

// Middlewares
app.use(helmet()); // Security headers

// Configure allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'https://divya-shree-three.vercel.app',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Session for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'divyashree_session_secret_2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies
    domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DivyaShree API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Email configuration check endpoint (for debugging)
app.get('/health/email', async (req, res) => {
  const { verifyEmailConnection } = require('./services/notification.service');
  const result = await verifyEmailConnection();
  res.status(result.success ? 200 : 500).json({
    ...result,
    configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
    user: process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : 'not set',
  });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes); // Public product routes
app.use('/api/reviews', reviewRoutes); // Review routes
app.use('/api/admin', adminRoutes); // Admin routes

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
