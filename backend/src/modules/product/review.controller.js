const reviewService = require('./review.service');

class ReviewController {
  // Create a new review
  async createReview(req, res) {
    try {
      const { productId } = req.params;
      const { name, email, rating, comment } = req.body;

      // Get name and email from logged-in user or request body
      let reviewerName, reviewerEmail;
      
      if (req.user) {
        // User is logged in - construct name from firstName and lastName
        reviewerName = `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.firstName || 'User';
        reviewerEmail = req.user.email;
      } else {
        // Guest user - use provided name and email
        reviewerName = name || 'Anonymous';
        reviewerEmail = email;
      }

      // Log for debugging
      console.log('Creating review:', {
        productId,
        userId: req.user?._id,
        userFirstName: req.user?.firstName,
        userLastName: req.user?.lastName,
        reviewerName,
        rating,
        commentLength: comment?.length
      });

      // Validate required fields
      if (!rating || !comment) {
        return res.status(400).json({
          success: false,
          message: 'Rating and comment are required'
        });
      }

      if (!comment || comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Comment must be at least 10 characters'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const reviewData = {
        product: productId,
        user: req.user?._id, // Optional - user might not be logged in
        name: reviewerName,
        email: reviewerEmail,
        rating: parseInt(rating),
        comment: comment.trim()
      };

      const result = await reviewService.createReview(reviewData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createReview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error.message
      });
    }
  }

  // Get reviews for a product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page, limit, sort } = req.query;

      const result = await reviewService.getProductReviews(productId, {
        page,
        limit,
        sort
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getProductReviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reviews',
        error: error.message
      });
    }
  }

  // Get review statistics for a product
  async getReviewStats(req, res) {
    try {
      const { productId } = req.params;

      const result = await reviewService.getReviewStats(productId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getReviewStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get review stats',
        error: error.message
      });
    }
  }

  // Get user's reviews
  async getUserReviews(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await reviewService.getUserReviews(req.user._id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getUserReviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user reviews',
        error: error.message
      });
    }
  }

  // Update a review
  async updateReview(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { reviewId } = req.params;
      const updateData = req.body;

      const result = await reviewService.updateReview(
        reviewId,
        req.user._id,
        updateData
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateReview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: error.message
      });
    }
  }

  // Delete a review
  async deleteReview(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { reviewId } = req.params;

      const result = await reviewService.deleteReview(reviewId, req.user._id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteReview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message
      });
    }
  }

  // Mark review as helpful
  async markHelpful(req, res) {
    try {
      const { reviewId } = req.params;

      const result = await reviewService.markHelpful(reviewId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in markHelpful:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful',
        error: error.message
      });
    }
  }
}

module.exports = new ReviewController();
