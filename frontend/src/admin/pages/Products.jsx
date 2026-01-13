import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import api from '@/services/axios';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    inStock: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalProducts: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.category && { category: filters.category }),
        ...(filters.inStock && { inStock: filters.inStock })
      };

      const response = await api.get('/admin/products', { params });
      setProducts(response.data.data.products);
      setPagination({
        page: response.data.data.pagination.currentPage,
        limit: response.data.data.pagination.limit,
        totalPages: response.data.data.pagination.totalPages,
        totalProducts: response.data.data.pagination.totalProducts
      });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/products/${productId}`);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Products Management</h1>
          <p className="font-body text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="sarees">Sarees</option>
            <option value="lehengas">Lehengas</option>
            <option value="kurtis">Kurtis</option>
            <option value="suits">Suits</option>
            <option value="gowns">Gowns</option>
          </select>

          {/* Stock Filter */}
          <select
            value={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
          >
            <option value="">All Stock Status</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E]"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x300'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.inStock && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                    {product.isBestseller && (
                      <div className="absolute top-2 left-2 bg-[#D4AF37] text-white text-xs px-2 py-1 rounded-full">
                        Bestseller
                      </div>
                    )}
                    {product.isNewArrival && (
                      <div className="absolute top-10 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-body text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="font-body text-xs text-gray-600 mb-2 capitalize">{product.category}</p>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-body text-lg font-bold text-[#6B1E1E]">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="font-body text-sm text-gray-500 line-through">
                            ₹{product.originalPrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="font-body text-xs text-green-600 font-semibold">
                            {product.salePercentage}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        Stock: {product.stockQuantity}
                      </span>
                      <span>Sold: {product.soldCount || 0}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        className="flex-1 px-3 py-2 text-sm font-body text-[#6B1E1E] border border-[#6B1E1E] rounded-lg hover:bg-[#6B1E1E] hover:text-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="px-3 py-2 text-sm font-body text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="font-body text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalProducts)} of {pagination.totalProducts} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-body text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="font-body text-gray-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
