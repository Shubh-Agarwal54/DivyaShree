const Review = require('./review.model');
const Product = require('./product.model');
const Order = require('../order/order.model');
const mongoose = require('mongoose');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});
const BUCKET = process.env.AWS_BUCKET_NAME;
const SIGNED_URL_EXPIRES = 3600;

async function presignReviewImages(keys = []) {
  if (!keys || keys.length === 0) return [];
  return Promise.all(
    keys.map(async (key) => {
      if (!key) return null;
      if (key.startsWith('http')) return key; // already a full URL (legacy)
      const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      return getSignedUrl(s3Client, cmd, { expiresIn: SIGNED_URL_EXPIRES });
    })
  );
}

class ReviewService {
  // Create a new review
  async createReview(reviewData) {
    try {
      const { product, user, name, email, rating, comment, images } = reviewData;

      // Check if product exists
      const productExists = await Product.findById(product);
      if (!productExists) {
        return { success: false, message: 'Product not found' };
      }

      // Check if user has already reviewed this product
      if (user) {
        const existingReview = await Review.findOne({ product, user });
        if (existingReview) {
          return { success: false, message: 'You have already reviewed this product' };
        }

        // Check if user purchased this product (verified purchase)
        const hasPurchased = await Order.findOne({
          user,
          'items.product': product,
          status: { $in: ['delivered', 'completed'] }
        });

        reviewData.isVerifiedPurchase = !!hasPurchased;
      }

      // Attach validated image S3 keys
      if (Array.isArray(images) && images.length > 0) {
        reviewData.images = images.slice(0, 5); // max 5 images
      }

      // Create review
      const review = await Review.create(reviewData);

      // Update product rating and review count
      await this.updateProductRating(product);

      const populatedReview = await Review.findById(review._id)
        .populate('user', 'firstName lastName email')
        .populate('product', 'name');

      // Generate presigned URLs for images
      const imageUrls = await presignReviewImages(populatedReview.images);
      const reviewObj = populatedReview.toObject();
      reviewObj.imageUrls = imageUrls;

      return { 
        success: true, 
        message: 'Review submitted successfully',
        data: reviewObj 
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return { success: false, message: error.message };
    }
  }

  // Get reviews for a product
  async getProductReviews(productId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt' } = options;
      const skip = (page - 1) * limit;

      const rawReviews = await Review.find({ 
        product: productId,
        isApproved: true 
      })
        .populate('user', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Review.countDocuments({ 
        product: productId,
        isApproved: true 
      });

      // Generate presigned URLs for each review's images
      const reviews = await Promise.all(
        rawReviews.map(async (r) => {
          const obj = r.toObject();
          obj.imageUrls = await presignReviewImages(r.images);
          return obj;
        })
      );

      return {
        success: true,
        data: {
          reviews,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return { success: false, message: error.message };
    }
  }

  // Get review statistics for a product
  async getReviewStats(productId) {
    try {
      // Convert productId to ObjectId for aggregation
      const objectId = mongoose.Types.ObjectId.isValid(productId) 
        ? new mongoose.Types.ObjectId(productId) 
        : productId;
      
      const stats = await Review.aggregate([
        { $match: { product: objectId, isApproved: true } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratings: {
              $push: '$rating'
            }
          }
        },
        {
          $project: {
            _id: 0,
            averageRating: { $round: ['$averageRating', 1] },
            totalReviews: 1,
            ratingDistribution: {
              5: {
                $size: {
                  $filter: {
                    input: '$ratings',
                    cond: { $eq: ['$$this', 5] }
                  }
                }
              },
              4: {
                $size: {
                  $filter: {
                    input: '$ratings',
                    cond: { $eq: ['$$this', 4] }
                  }
                }
              },
              3: {
                $size: {
                  $filter: {
                    input: '$ratings',
                    cond: { $eq: ['$$this', 3] }
                  }
                }
              },
              2: {
                $size: {
                  $filter: {
                    input: '$ratings',
                    cond: { $eq: ['$$this', 2] }
                  }
                }
              },
              1: {
                $size: {
                  $filter: {
                    input: '$ratings',
                    cond: { $eq: ['$$this', 1] }
                  }
                }
              }
            }
          }
        }
      ]);

      return {
        success: true,
        data: stats[0] || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return { success: false, message: error.message };
    }
  }

  // Update product rating based on reviews
  async updateProductRating(productId) {
    try {
      const stats = await this.getReviewStats(productId);
      
      if (stats.success && stats.data) {
        await Product.findByIdAndUpdate(productId, {
          rating: stats.data.averageRating || 0,
          reviews: stats.data.totalReviews || 0
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating product rating:', error);
      return { success: false, message: error.message };
    }
  }

  // Get user's reviews
  async getUserReviews(userId) {
    try {
      const reviews = await Review.find({ user: userId })
        .populate('product', 'name images price')
        .sort('-createdAt');

      return { success: true, data: reviews };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return { success: false, message: error.message };
    }
  }

  // Update a review
  async updateReview(reviewId, userId, updateData) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      
      if (!review) {
        return { success: false, message: 'Review not found or unauthorized' };
      }

      const allowedUpdates = ['rating', 'comment'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updates,
        { new: true, runValidators: true }
      ).populate('user', 'name email');

      // Update product rating
      await this.updateProductRating(review.product);

      return { 
        success: true, 
        message: 'Review updated successfully',
        data: updatedReview 
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return { success: false, message: error.message };
    }
  }

  // Delete a review
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });
      
      if (!review) {
        return { success: false, message: 'Review not found or unauthorized' };
      }

      const productId = review.product;
      await Review.findByIdAndDelete(reviewId);

      // Update product rating
      await this.updateProductRating(productId);

      return { success: true, message: 'Review deleted successfully' };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, message: error.message };
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId) {
    try {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { $inc: { helpful: 1 } },
        { new: true }
      );

      if (!review) {
        return { success: false, message: 'Review not found' };
      }

      return { success: true, data: review };
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new ReviewService();
