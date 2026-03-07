import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ADMIN_ROLES = ['admin', 'subadmin', 'masteradmin', 'superadmin'];

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(form.email.trim().toLowerCase(), form.password);

      if (result.success) {
        // Read the just-stored user to check role
        const stored = localStorage.getItem('divyashree_user');
        const user = stored ? JSON.parse(stored) : null;

        if (!user || !ADMIN_ROLES.includes(user.role)) {
          // Not an admin — clear credentials and show error
          localStorage.removeItem('divyashree_user');
          localStorage.removeItem('divyashree_token');
          setError('Access denied. This portal is for admin staff only.');
          setLoading(false);
          return;
        }

        navigate('/admin', { replace: true });
      } else if (result.requiresVerification) {
        setError('Email not verified. Please contact your system administrator.');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0505] via-[#3d0e0e] to-[#6B1E1E] flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-wide">DivyaShree</h1>
          <p className="text-white/60 font-body text-sm mt-1">Admin Portal</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-1">Sign In</h2>
          <p className="font-body text-sm text-gray-500 mb-6">Enter your credentials to access the admin panel</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-body text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
                placeholder="admin@divyashree.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#6B1E1E] hover:bg-[#8B2E2E] text-white font-body font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-xs text-gray-400">
            This portal is restricted to authorised staff only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
