const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Public routes
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/reviews/stats', reviewController.getReviewStats);

// Routes that work with or without auth
router.post('/products/:productId/reviews', (req, res, next) => {
  // Try to authenticate, but don't require it
  authMiddleware.optional(req, res, next);
}, reviewController.createReview);

// Protected routes (require authentication)
router.get('/my-reviews', authMiddleware.required, reviewController.getUserReviews);
router.put('/reviews/:reviewId', authMiddleware.required, reviewController.updateReview);
router.delete('/reviews/:reviewId', authMiddleware.required, reviewController.deleteReview);

// Semi-public route - can mark as helpful without auth
router.post('/reviews/:reviewId/helpful', reviewController.markHelpful);

module.exports = router;
