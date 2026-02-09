const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['sarees', 'lehengas', 'kurtis', 'suits', 'gowns', 'accessories'],
  },
  fabric: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  salePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [{
    type: String,
  }],
  description: {
    type: String,
    trim: true,
  },
  features: [{
    type: String,
  }],
  occasions: [{
    type: String,
  }],
  care: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Auto-calculate sale percentage
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    this.salePercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.salePercentage = 0;
  }
  next();
});

// Update inStock based on stockQuantity
productSchema.pre('save', function(next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
