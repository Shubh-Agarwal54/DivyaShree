const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['hero', 'bestseller', 'app-exclusive', 'modern-shehzadi', 'store-experience'],
    },
    imageUrl: {
      type: String,
      default: null, // null = use default static asset on frontend
    },
    texts: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
