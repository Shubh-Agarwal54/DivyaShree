import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  UserCircle,
  Warehouse,
  Shield,
} from 'lucide-react';
import api from '@/services/axios';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('AdminLayout - Waiting for auth to load...');
      return;
    }

    // Check if user is admin
    console.log('AdminLayout - User:', user);
    console.log('AdminLayout - User Role:', user?.role);
    
    if (!user) {
      console.log('AdminLayout - No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!['admin', 'subadmin', 'masteradmin', 'superadmin'].includes(user.role)) {
      console.log('AdminLayout - User role not authorized:', user.role);
      navigate('/login');
      return;
    }
    
    console.log('AdminLayout - User authorized, fetching permissions');
    fetchPermissions();
  }, [user, navigate, authLoading]);

  const fetchPermissions = async () => {
    try {
      console.log('Fetching permissions from /admin/permissions/my');
      const response = await api.get('/admin/permissions/my');
      console.log('Permissions response:', response.data);
      setPermissions(response.data.data.permissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/admin/orders');
      const orders = response.data.data?.orders || [];
      const pending = orders.filter(
        order => order.returnExchange?.status === 'requested'
      ).length;
      setPendingRequests(pending);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  // Poll for pending requests every 30 seconds
  useEffect(() => {
    if (permissions && canAccess('orders', 'view')) {
      fetchPendingRequests();
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [permissions]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while permissions are being fetched
  if (!user || !['admin', 'subadmin', 'masteradmin', 'superadmin'].includes(user.role)) {
    return null;
  }

  if (!permissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E1E] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-body">Loading permissions...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canAccess = (resource, action = 'view') => {
    if (!permissions) return false;
    return permissions[resource]?.[action] === true;
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin/dashboard',
      show: canAccess('dashboard', 'view')
    },
    { 
      icon: Users, 
      label: 'Users', 
      path: '/admin/users',
      show: canAccess('users', 'view')
    },
    { 
      icon: ShoppingBag, 
      label: 'Orders', 
      path: '/admin/orders',
      show: canAccess('orders', 'view')
    },
    { 
      icon: Package, 
      label: 'Products', 
      path: '/admin/products',
      show: canAccess('products', 'view')
    },
    { 
      icon: Warehouse, 
      label: 'Inventory', 
      path: '/admin/inventory',
      show: canAccess('inventory', 'view')
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/admin/analytics',
      show: canAccess('analytics', 'view')
    },
    { 
      icon: Shield, 
      label: 'Role Permissions', 
      path: '/admin/role-permissions',
      show: canAccess('rolePermissions', 'view')
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/admin/settings',
      show: canAccess('settings', 'view')
    },
  ].filter(item => item.show);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-50' : 'w-15'
        } bg-gradient-to-b from-[#6B1E1E] to-[#8B2E2E] text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37] text-2xl">✦</span>
                <h1 className="font-display text-xl font-bold">Shree Divya</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-white/10 rounded mx-auto"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-body">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <UserCircle size={32} />
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-body text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="font-body text-xs text-white/70">Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 px-4 py-2 w-full rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${
              !sidebarOpen && 'justify-center px-2'
            }`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="font-body text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-[#6B1E1E]">Admin Panel</h2>
            <p className="font-body text-sm text-gray-600">Manage your e-commerce platform</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/orders')}
              className="relative p-2 hover:bg-gray-100 rounded-lg group"
            >
              <Bell size={20} className="text-gray-600" />
              {pendingRequests > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {pendingRequests}
                  </span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
