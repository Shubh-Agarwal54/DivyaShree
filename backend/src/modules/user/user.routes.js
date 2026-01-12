const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const passport = require('../../config/passport');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// OTP verification routes
router.post('/verify-email-otp', userController.verifyEmailOTP);
router.post('/verify-phone-otp', userController.verifyPhoneOTP);
router.post('/resend-email-otp', userController.resendEmailOTP);
router.post('/resend-phone-otp', userController.resendPhoneOTP);

// Password reset routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Google OAuth routes
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  userController.googleCallback
);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Address routes
router.get('/addresses', authMiddleware, userController.getAddresses);
router.post('/addresses', authMiddleware, userController.addAddress);
router.put('/addresses/:addressId', authMiddleware, userController.updateAddress);
router.delete('/addresses/:addressId', authMiddleware, userController.deleteAddress);
router.patch('/addresses/:addressId/default', authMiddleware, userController.setDefaultAddress);

// Wishlist routes
router.get('/wishlist', authMiddleware, userController.getWishlist);
router.post('/wishlist', authMiddleware, userController.addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, userController.removeFromWishlist);

module.exports = router;
