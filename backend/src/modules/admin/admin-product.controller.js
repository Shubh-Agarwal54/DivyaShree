const Product = require('../product/product.model');
const adminAuditService = require('./admin-audit.service');

class AdminProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        inStock = '',
        onSale = '',
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const query = {};

      // Search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      // Filters
      if (category) query.category = category;
      if (inStock !== '') query.inStock = inStock === 'true';
      if (onSale !== '') query.onSale = onSale === 'true';

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

  // Get single product
  async getProduct(req, res) {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

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

  // Create product
  async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        createdBy: req.userId,
      };

      const product = new Product(productData);
      await product.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'PRODUCT_CREATED',
        'products',
        product._id,
        { after: product },
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updates = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const oldValues = JSON.parse(JSON.stringify(product));

      Object.assign(product, updates);
      await product.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'PRODUCT_UPDATED',
        'products',
        productId,
        { before: oldValues, after: updates },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const productData = JSON.parse(JSON.stringify(product));
      await Product.deleteOne({ _id: productId });

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'PRODUCT_DELETED',
        'products',
        productId,
        { before: productData },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }

  // Update stock
  async updateStock(req, res) {
    try {
      const { productId } = req.params;
      const { stockQuantity } = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const oldStock = product.stockQuantity;
      product.stockQuantity = stockQuantity;
      await product.save();

      // Log action
      await adminAuditService.logAction(
        req.userId,
        req.user.email,
        'PRODUCT_STOCK_UPDATED',
        'products',
        productId,
        { before: { stockQuantity: oldStock }, after: { stockQuantity } },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update stock',
        error: error.message,
      });
    }
  }

  // Get product stats
  async getProductStats(req, res) {
    try {
      const totalProducts = await Product.countDocuments();
      const inStockProducts = await Product.countDocuments({ inStock: true });
      const outOfStockProducts = await Product.countDocuments({ inStock: false });
      const onSaleProducts = await Product.countDocuments({ onSale: true });
      const bestsellerProducts = await Product.countDocuments({ isBestseller: true });
      const newArrivals = await Product.countDocuments({ isNewArrival: true });

      // Products by category
      const categoryStats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      // Top selling products
      const topProducts = await Product.find()
        .sort({ soldCount: -1 })
        .limit(10)
        .select('name soldCount price images');

      res.status(200).json({
        success: true,
        data: {
          totalProducts,
          inStockProducts,
          outOfStockProducts,
          onSaleProducts,
          bestsellerProducts,
          newArrivals,
          categoryStats,
          topProducts,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product statistics',
        error: error.message,
      });
    }
  }
}

module.exports = new AdminProductController();
