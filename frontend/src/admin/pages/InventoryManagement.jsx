import { useEffect, useState } from 'react';
import { Package, TrendingDown, AlertTriangle, Search, Filter, Plus, Minus, RotateCcw, Eye, X as CloseIcon } from 'lucide-react';
import Barcode from 'react-barcode';
import api from '@/services/axios';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: '',
  });
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({
    quantity: 0,
    action: 'add',
    reason: '',
  });
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, [filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);

      const response = await api.get(`/admin/inventory?${params.toString()}`);
      setInventory(response.data.data.products);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    try {
      await api.patch(`/admin/inventory/${selectedProduct._id}/stock`, stockUpdate);
      setShowStockModal(false);
      setSelectedProduct(null);
      setStockUpdate({ quantity: 0, action: 'add', reason: '' });
      fetchInventory();
      alert('Stock updated successfully!');
    } catch (error) {
      console.error('Failed to update stock:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update stock';
      alert(errorMessage);
    }
  };

  const getStockStatusColor = (quantity) => {
    if (quantity === 0) return 'inventory-out-of-stock';
    if (quantity <= 10) return 'inventory-low-stock';
    return 'inventory-in-stock';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="inventory-loading-container">
        <div className="inventory-spinner"></div>
      </div>
    );
  }

  return (
    <div className="inventory-management-container">
      {/* Header */}
      <div className="inventory-header-section">
        <div>
          <h1 className="inventory-main-title">Inventory Management</h1>
          <p className="inventory-subtitle">Track and manage product stock levels</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="inventory-stats-grid">
        <div className="inventory-stat-card">
          <div className="inventory-stat-content">
            <div>
              <p className="inventory-stat-label">Total Products</p>
              <p className="inventory-stat-value">{stats?.totalProducts || 0}</p>
            </div>
            <div className="inventory-stat-icon inventory-icon-blue">
              <Package size={24} />
            </div>
          </div>
        </div>
        
        <div className="inventory-stat-card">
          <div className="inventory-stat-content">
            <div>
              <p className="inventory-stat-label">In Stock</p>
              <p className="inventory-stat-value">{stats?.inStockProducts || 0}</p>
            </div>
            <div className="inventory-stat-icon inventory-icon-green">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-content">
            <div>
              <p className="inventory-stat-label">Low Stock</p>
              <p className="inventory-stat-value">{stats?.lowStockProducts || 0}</p>
            </div>
            <div className="inventory-stat-icon inventory-icon-yellow">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-content">
            <div>
              <p className="inventory-stat-label">Out of Stock</p>
              <p className="inventory-stat-value">{stats?.outOfStockProducts || 0}</p>
            </div>
            <div className="inventory-stat-icon inventory-icon-red">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="inventory-filters-section">
        <div className="inventory-search-box">
          <Search size={20} className="inventory-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="inventory-search-input"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <select
          className="inventory-filter-select"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          <option value="sarees">Sarees</option>
          <option value="lehengas">Lehengas</option>
          <option value="kurtis">Kurtis</option>
          <option value="suits">Suits</option>
          <option value="gowns">Gowns</option>
        </select>

        <select
          className="inventory-filter-select"
          value={filters.stockStatus}
          onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
        >
          <option value="">All Stock Status</option>
          <option value="inStock">In Stock</option>
          <option value="lowStock">Low Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr className="inventory-table-header">
              <th className="inventory-th">Product</th>
              <th className="inventory-th">Product ID</th>
              <th className="inventory-th">SKU</th>
              <th className="inventory-th">Barcode</th>
              <th className="inventory-th">Category</th>
              <th className="inventory-th">Stock Quantity</th>
              <th className="inventory-th">Status</th>
              <th className="inventory-th">Price</th>
              <th className="inventory-th">Sold</th>
              <th className="inventory-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((product) => (
              <tr key={product._id} className="inventory-table-row">
                <td className="inventory-td">
                  <div className="inventory-product-info">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/48x48'}
                      alt={product.name}
                      className="inventory-product-image"
                    />
                    <span className="inventory-product-name">{product.name}</span>
                  </div>
                </td>
                <td className="inventory-td">
                  <span className="inventory-product-id">{product._id.substring(product._id.length - 8)}</span>
                </td>
                <td className="inventory-td">
                  <span className="inventory-sku"> DS-{(product._id || product.id)?.toString().slice(-6).toUpperCase()} </span>
                </td>
                <td className="inventory-td">
                  <div className="inventory-barcode-cell">
                    <span className="inventory-barcode">{product.barcode }</span>
                    <button
                      onClick={() => {
                        setBarcodeProduct(product);
                        setShowBarcodeModal(true);
                      }}
                      className="inventory-barcode-view-btn"
                      title="View Barcode"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
                <td className="inventory-td">
                  <span className="inventory-category-badge">{product.category}</span>
                </td>
                <td className="inventory-td">
                  <span className="inventory-stock-quantity">{product.stockQuantity}</span>
                </td>
                <td className="inventory-td">
                  <span className={`inventory-status-badge ${getStockStatusColor(product.stockQuantity)}`}>
                    {getStockStatusText(product.stockQuantity)}
                  </span>
                </td>
                <td className="inventory-td">₹{product.price?.toLocaleString('en-IN')}</td>
                <td className="inventory-td">{product.soldCount}</td>
                <td className="inventory-td">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowStockModal(true);
                    }}
                    className="inventory-action-button"
                  >
                    Update Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {inventory.length === 0 && (
          <div className="inventory-empty-state">
            <Package size={48} className="inventory-empty-icon" />
            <p className="inventory-empty-text">No products found</p>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <div className="inventory-modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="inventory-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="inventory-modal-title">Update Stock - {selectedProduct.name}</h3>
            
            <div className="inventory-modal-body">
              {/* Product Details */}
              <div className="inventory-product-details">
                <div className="inventory-detail-row">
                  <span className="inventory-detail-label">Product ID:</span>
                  <span className="inventory-detail-value inventory-detail-code">{selectedProduct._id.substring(selectedProduct._id.length - 8)}</span>
                </div>
                {selectedProduct.sku && (
                  <div className="inventory-detail-row">
                    <span className="inventory-detail-label">SKU:</span>
                    <span className="inventory-detail-value inventory-detail-code">{selectedProduct.sku}</span>
                  </div>
                )}
                {selectedProduct.barcode && (
                  <div className="inventory-detail-row">
                    <span className="inventory-detail-label">Barcode:</span>
                    <span className="inventory-detail-value inventory-detail-code">{selectedProduct.barcode}</span>
                  </div>
                )}
              </div>

              <div className="inventory-current-stock">
                <span className="inventory-modal-label">Current Stock:</span>
                <span className="inventory-modal-value">{selectedProduct.stockQuantity}</span>
              </div>

              <div className="inventory-form-group">
                <label className="inventory-modal-label">Action</label>
                <div className="inventory-action-buttons">
                  <button
                    className={`inventory-action-tab ${stockUpdate.action === 'add' ? 'inventory-action-tab-active' : ''}`}
                    onClick={() => setStockUpdate({ ...stockUpdate, action: 'add' })}
                  >
                    <Plus size={16} /> Add
                  </button>
                  <button
                    className={`inventory-action-tab ${stockUpdate.action === 'subtract' ? 'inventory-action-tab-active' : ''}`}
                    onClick={() => setStockUpdate({ ...stockUpdate, action: 'subtract' })}
                  >
                    <Minus size={16} /> Subtract
                  </button>
                  <button
                    className={`inventory-action-tab ${stockUpdate.action === 'set' ? 'inventory-action-tab-active' : ''}`}
                    onClick={() => setStockUpdate({ ...stockUpdate, action: 'set' })}
                  >
                    <RotateCcw size={16} /> Set
                  </button>
                </div>
              </div>

              <div className="inventory-form-group">
                <label className="inventory-modal-label">Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="inventory-modal-input"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value)  })}
                />
              </div>

              <div className="inventory-form-group">
                <label className="inventory-modal-label">Reason (Optional)</label>
                <textarea
                  className="inventory-modal-textarea"
                  placeholder="Enter reason for stock update..."
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                />
              </div>
            </div>

            <div className="inventory-modal-footer">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedProduct(null);
                  setStockUpdate({ quantity: 0, action: 'add', reason: '' });
                }}
                className="inventory-modal-button inventory-modal-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="inventory-modal-button inventory-modal-button-confirm"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {showBarcodeModal && barcodeProduct && (
        <div className="inventory-modal-overlay" onClick={() => setShowBarcodeModal(false)}>
          <div className="inventory-barcode-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="inventory-barcode-modal-header">
              <h3 className="inventory-modal-title">Product Barcode</h3>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="inventory-barcode-close-btn"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            
            <div className="inventory-barcode-modal-body">
              <div className="inventory-barcode-product-info">
                <img
                  src={barcodeProduct.images?.[0] || 'https://placehold.co/80x80'}
                  alt={barcodeProduct.name}
                  className="inventory-barcode-product-image"
                />
                <div>
                  <h4 className="inventory-barcode-product-name">{barcodeProduct.name}</h4>
                  <p className="inventory-barcode-product-meta">
                    ID: {barcodeProduct._id.substring(barcodeProduct._id.length - 8)}
                  </p>
                </div>
              </div>

              <div className="inventory-barcode-display">
                <Barcode
                  value={barcodeProduct._id}
                  format="CODE128"
                  width={2}
                  height={100}
                  displayValue={true}
                  fontSize={14}
                  margin={10}
                />
              </div>

              <div className="inventory-barcode-instructions">
                <p>💡 Scan this barcode with your barcode scanner to identify the product</p>
                <p className="inventory-barcode-note">Barcode Value: {barcodeProduct._id}</p>
              </div>

              <button
                onClick={() => window.print()}
                className="inventory-barcode-print-btn"
              >
                🖨️ Print Barcode
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        
      `}</style>
    </div>
  );
};

export default InventoryManagement;
