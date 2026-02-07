const Product = require('../product/product.model');

// Get inventory overview
exports.getInventoryOverview = async (req, res) => {
  try {
    const { search, category, stockStatus, sortBy = 'name', order = 'asc' } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (stockStatus) {
      switch (stockStatus) {
        case 'inStock':
          query.stockQuantity = { $gt: 10 };
          break;
        case 'lowStock':
          query.stockQuantity = { $gte: 1, $lte: 10 };
          break;
        case 'outOfStock':
          query.stockQuantity = 0;
          break;
      }
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .select('name category stockQuantity price images inStock soldCount sku barcode')
      .sort(sortOptions);

    // Calculate stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const inStockProducts = await Product.countDocuments({ isActive: true, stockQuantity: { $gt: 10 } });
    const lowStockProducts = await Product.countDocuments({ isActive: true, stockQuantity: { $gte: 1, $lte: 10 } });
    const outOfStockProducts = await Product.countDocuments({ isActive: true, stockQuantity: 0 });
    const totalValue = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stockQuantity'] } } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        stats: {
          totalProducts,
          inStockProducts,
          lowStockProducts,
          outOfStockProducts,
          totalInventoryValue: totalValue[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      isActive: true,
      stockQuantity: { $lte: 10, $gt: 0 },
    })
      .select('name category stockQuantity price images')
      .sort({ stockQuantity: 1 });

    const outOfStockProducts = await Product.find({
      isActive: true,
      stockQuantity: 0,
    })
      .select('name category stockQuantity price images')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        lowStockProducts,
        outOfStockProducts,
        totalAlerts: lowStockProducts.length + outOfStockProducts.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock alerts',
      error: error.message,
    });
  }
};

// Update stock quantity
exports.updateStockQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, action, reason } = req.body; // action: 'set', 'add', 'subtract'

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const oldQuantity = product.stockQuantity; // Save old value before updating
    let newQuantity = product.stockQuantity;

    switch (action) {
      case 'set':
        newQuantity = quantity;
        break;
      case 'add':
        newQuantity += quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, newQuantity - quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use set, add, or subtract',
        });
    }

    product.stockQuantity = newQuantity;
    product.inStock = newQuantity > 0;
    await product.save();

    // Log audit trail
    const adminAuditService = require('./admin-audit.service');
    await adminAuditService.log({
      userId: req.user._id,
      action: 'UPDATE_STOCK',
      resource: 'Product',
      resourceId: productId,
      changes: {
        field: 'stockQuantity',
        oldValue: oldQuantity,
        newValue: newQuantity,
        action,
        reason,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          stockQuantity: product.stockQuantity,
          inStock: product.inStock,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message,
    });
  }
};

// Bulk update stock
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, quantity, action }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required',
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const product = await Product.findById(update.productId);
        if (!product) {
          errors.push({ productId: update.productId, error: 'Product not found' });
          continue;
        }

        let newQuantity = product.stockQuantity;
        switch (update.action) {
          case 'set':
            newQuantity = update.quantity;
            break;
          case 'add':
            newQuantity += update.quantity;
            break;
          case 'subtract':
            newQuantity = Math.max(0, newQuantity - update.quantity);
            break;
        }

        product.stockQuantity = newQuantity;
        product.inStock = newQuantity > 0;
        await product.save();

        results.push({
          productId: product._id,
          name: product.name,
          newQuantity,
        });
      } catch (err) {
        errors.push({ productId: update.productId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk stock update completed',
      data: {
        successful: results,
        failed: errors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update',
      error: error.message,
    });
  }
};

// Get inventory history (stock movements)
exports.getInventoryHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const adminAuditService = require('./admin-audit.service');

    const history = await adminAuditService.getResourceAuditTrail('Product', productId);

    // Filter only stock-related changes
    const stockHistory = history.data.filter(log => 
      log.action === 'UPDATE_STOCK' || 
      (log.action === 'UPDATE' && log.changes?.field === 'stockQuantity')
    );

    res.status(200).json({
      success: true,
      data: stockHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory history',
      error: error.message,
    });
  }
};
