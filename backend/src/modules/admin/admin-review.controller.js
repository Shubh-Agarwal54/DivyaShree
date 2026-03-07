const Review = require('../product/review.model');
const Product = require('../product/product.model');
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
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

async function presignKey(key) {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3Client, cmd, { expiresIn: SIGNED_URL_EXPIRES });
}

async function enrichReview(review) {
  const obj = review.toObject ? review.toObject() : { ...review };
  if (obj.images && obj.images.length > 0) {
    obj.imageUrls = await Promise.all(obj.images.map(presignKey));
  } else {
    obj.imageUrls = [];
  }
  return obj;
}

class AdminReviewController {
  // GET /admin/reviews
  async getAllReviews(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        rating,
        isApproved,
        productId,
        search,
        sort = '-createdAt',
      } = req.query;

      const filter = {};
      if (rating) filter.rating = parseInt(rating);
      if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
      if (productId) filter.product = productId;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { comment: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [rawReviews, total] = await Promise.all([
        Review.find(filter)
          .populate('product', 'name images price category')
          .populate('user', 'firstName lastName email')
          .populate('adminResponse.respondedBy', 'firstName lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Review.countDocuments(filter),
      ]);

      const reviews = await Promise.all(rawReviews.map(enrichReview));

      const stats = await Review.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            withImages: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] }, 1, 0] } },
            responded: { $sum: { $cond: [{ $ifNull: ['$adminResponse.comment', false] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] } },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          reviews,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          stats: stats[0] || { total: 0, avgRating: 0, withImages: 0, responded: 0, pending: 0 },
        },
      });
    } catch (error) {
      console.error('Admin getAllReviews error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
    }
  }

  // GET /admin/reviews/:reviewId
  async getReviewById(req, res) {
    try {
      const review = await Review.findById(req.params.reviewId)
        .populate('product', 'name images price category')
        .populate('user', 'firstName lastName email')
        .populate('adminResponse.respondedBy', 'firstName lastName');

      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

      const enriched = await enrichReview(review);
      res.status(200).json({ success: true, data: enriched });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch review', error: error.message });
    }
  }

  // DELETE /admin/reviews/:reviewId
  async deleteReview(req, res) {
    try {
      const review = await Review.findById(req.params.reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

      // Delete S3 images
      if (review.images && review.images.length > 0) {
        await Promise.allSettled(
          review.images.map((key) => {
            if (key && !key.startsWith('http')) {
              return s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
            }
          })
        );
      }

      await Review.findByIdAndDelete(req.params.reviewId);

      // Update product rating
      const product = review.product;
      if (product) {
        const stats = await Review.aggregate([
          { $match: { product, isApproved: true } },
          { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        await Product.findByIdAndUpdate(product, {
          rating: stats[0]?.avg || 0,
          reviews: stats[0]?.count || 0,
        });
      }

      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Admin deleteReview error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
    }
  }

  // POST /admin/reviews/:reviewId/respond
  async respondToReview(req, res) {
    try {
      const { comment } = req.body;
      if (!comment || !comment.trim()) {
        return res.status(400).json({ success: false, message: 'Response comment is required' });
      }

      const review = await Review.findByIdAndUpdate(
        req.params.reviewId,
        {
          adminResponse: {
            comment: comment.trim(),
            respondedAt: new Date(),
            respondedBy: req.user._id,
          },
        },
        { new: true }
      )
        .populate('product', 'name')
        .populate('adminResponse.respondedBy', 'firstName lastName');

      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

      const enriched = await enrichReview(review);
      res.status(200).json({ success: true, message: 'Response added successfully', data: enriched });
    } catch (error) {
      console.error('Admin respondToReview error:', error);
      res.status(500).json({ success: false, message: 'Failed to respond to review', error: error.message });
    }
  }

  // DELETE /admin/reviews/:reviewId/response  (remove response)
  async deleteResponse(req, res) {
    try {
      const review = await Review.findByIdAndUpdate(
        req.params.reviewId,
        { $unset: { adminResponse: '' } },
        { new: true }
      );
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
      res.status(200).json({ success: true, message: 'Response removed', data: review });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove response', error: error.message });
    }
  }

  // PATCH /admin/reviews/:reviewId/approve
  async toggleApproval(req, res) {
    try {
      const review = await Review.findById(req.params.reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

      review.isApproved = !review.isApproved;
      await review.save();

      // Recalculate product rating
      const stats = await Review.aggregate([
        { $match: { product: review.product, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await Product.findByIdAndUpdate(review.product, {
        rating: stats[0]?.avg || 0,
        reviews: stats[0]?.count || 0,
      });

      res.status(200).json({
        success: true,
        message: `Review ${review.isApproved ? 'approved' : 'hidden'}`,
        data: { isApproved: review.isApproved },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to toggle approval', error: error.message });
    }
  }
}

module.exports = new AdminReviewController();
