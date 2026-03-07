const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const reviewController = require('./review.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// S3 client for review image uploads
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const reviewUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `reviews/${req.params.productId || 'general'}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // max 5 images, 5MB each
});

// Public routes
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/reviews/stats', reviewController.getReviewStats);

// Routes that work with or without auth
router.post('/products/:productId/reviews',
  (req, res, next) => authMiddleware.optional(req, res, next),
  reviewUpload.array('images', 5),
  reviewController.createReview
);

// Protected routes (require authentication)
router.get('/my-reviews', authMiddleware.required, reviewController.getUserReviews);
router.put('/reviews/:reviewId', authMiddleware.required, reviewController.updateReview);
router.delete('/reviews/:reviewId', authMiddleware.required, reviewController.deleteReview);

// Semi-public route - can mark as helpful without auth
router.post('/reviews/:reviewId/helpful', reviewController.markHelpful);

module.exports = router;
