const Product = require('../product/product.model');

class ProductController {
  // Get all products (public)
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        minPrice = 0,
        maxPrice = 999999,
        inStock = '',
        onSale = '',
        isBestseller = '',
        isNewArrival = '',
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const query = { isActive: true };

      // Search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { fabric: { $regex: search, $options: 'i' } },
        ];
      }

      // Filters
      if (category) query.category = category;
      if (inStock !== '') query.inStock = inStock === 'true';
      if (onSale !== '') query.onSale = onSale === 'true';
      if (isBestseller !== '') query.isBestseller = isBestseller === 'true';
      if (isNewArrival !== '') query.isNewArrival = isNewArrival === 'true';
      
      query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };

      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;

      const products = await Product.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            totalProducts: total,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  // Get single product by ID (public)
  async getProduct(req, res) {
    try {
      const { productId } = req.params;

      // Validate MongoDB ObjectID
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const product = await Product.findOne({ _id: productId, isActive: true });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Increment view count
      product.viewCount += 1;
      await product.save();

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message,
      });
    }
  }

  // Get featured products (bestsellers, new arrivals)
  async getFeaturedProducts(req, res) {
    try {
      const { type = 'bestseller', limit = 8 } = req.query;

      let query = { isActive: true };
      
      if (type === 'bestseller') {
        query.isBestseller = true;
      } else if (type === 'new') {
        query.isNewArrival = true;
      } else if (type === 'sale') {
        query.onSale = true;
      }

      const products = await Product.find(query)
        .sort({ soldCount: -1, createdAt: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured products',
        error: error.message,
      });
    }
  }

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

      const query = { category, isActive: true };
      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;

      const products = await Product.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            totalProducts: total,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  // Get related products
  async getRelatedProducts(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 4 } = req.query;

      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Find related products with same category or occasions
      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        isActive: true,
        $or: [
          { category: product.category },
          { occasions: { $in: product.occasions } },
        ],
      })
        .sort({ soldCount: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        data: relatedProducts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch related products',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
