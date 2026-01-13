const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

// Public routes - no authentication required

// Get all products
router.get('/', productController.getAllProducts);

// Get featured products (bestsellers, new arrivals, sale)
router.get('/featured', productController.getFeaturedProducts);

// Get products by category
router.get('/category/:category', productController.getProductsByCategory);

// Get single product by ID
router.get('/:productId', productController.getProduct);

// Get related products
router.get('/:productId/related', productController.getRelatedProducts);

module.exports = router;
