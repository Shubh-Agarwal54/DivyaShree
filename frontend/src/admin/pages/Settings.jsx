import { useState, useEffect, useRef } from 'react';
import { Save, Mail, Bell, Shield, Database, Image, ChevronDown, ChevronUp, Upload, RotateCcw, Check, AlertCircle, Tag, Plus, Trash2, Edit2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { bannerAPI } from '@/services/api';
import api from '@/services/axios';

// ── Promo Coupon Management ──────────────────────────────────────────────────

const EMPTY_PROMO = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  maxUses: '',
  isActive: true,
  expiresAt: '',
};

const PromoFormModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || EMPTY_PROMO);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      setError('Code and discount value are required');
      return;
    }
    setSaving(true);
    setError('');
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-display text-xl font-semibold text-gray-900">
            {initial ? 'Edit Coupon' : 'New Coupon'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-body">
              <AlertCircle size={15} />{error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Coupon Code *</label>
              <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SAVE20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm uppercase" />
            </div>
            <div className="col-span-2">
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Brief description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm" />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Discount Type *</label>
              <select name="discountType" value={form.discountType} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">
                Discount Value * {form.discountType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange}
                min="0" placeholder={form.discountType === 'percentage' ? '10' : '100'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm" />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Min Order Amount (₹)</label>
              <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange}
                min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm" />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Max Discount (₹) <span className="text-gray-400">(optional)</span></label>
              <input type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange}
                min="0" placeholder="Leave empty for no cap"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm" />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Max Uses <span className="text-gray-400">(optional)</span></label>
              <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange}
                min="1" placeholder="Unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm" />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-gray-600 mb-1">Expires At <span className="text-gray-400">(optional)</span></label>
              <input type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] font-body text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
              className="w-4 h-4 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]" />
            <span className="font-body text-sm text-gray-700">Active (visible to customers)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-body text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 font-body text-sm flex items-center justify-center gap-2">
              <Save size={15} />{saving ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BANNER_CONFIGS = [
  {
    key: 'hero',
    label: 'Hero Banner',
    fields: [
      { name: 'scriptText', label: 'Script Text (e.g. Shaadi)' },
      { name: 'displayTitle', label: 'Display Title (e.g. Carnival)' },
      { name: 'scriptText2', label: 'Script Text 2 (e.g. Flash)' },
      { name: 'displayTitle2', label: 'Display Title 2 (e.g. Sale)' },
      { name: 'discountText', label: 'Discount Text (e.g. FLAT 50% OFF)' },
      { name: 'discountSubtext', label: 'Discount Subtext (e.g. Lehengas)' },
      { name: 'buttonText', label: 'Button Text' },
      { name: 'buttonLink', label: 'Button Link' },
    ],
  },
  {
    key: 'bestseller',
    label: 'Bestseller Banner',
    fields: [
      { name: 'scriptText', label: 'Script Text (e.g. Bestseller)' },
      { name: 'displayTitle', label: 'Display Title (e.g. Brigade)' },
      { name: 'buttonText', label: 'Button Text' },
      { name: 'buttonLink', label: 'Button Link' },
    ],
  },
  {
    key: 'app-exclusive',
    label: 'App Exclusive Banner',
    fields: [
      { name: 'displayTitle', label: 'Display Title (e.g. APP EXCLUSIVE)' },
      { name: 'scriptText', label: 'Script Text (e.g. Offer)' },
      { name: 'discountText', label: 'Discount Text (e.g. FLAT 15%)' },
      { name: 'couponCode', label: 'Coupon Code' },
      { name: 'buttonText', label: 'Button Text' },
    ],
  },
  {
    key: 'modern-shehzadi',
    label: 'Modern Shehzadi Banner',
    fields: [
      { name: 'scriptText', label: 'Script Text (e.g. Modern)' },
      { name: 'displayTitle', label: 'Display Title (e.g. Shehzadi)' },
      { name: 'description', label: 'Description' },
      { name: 'buttonText', label: 'Button Text' },
      { name: 'buttonLink', label: 'Button Link' },
    ],
  },
  {
    key: 'store-experience',
    label: 'Store Experience Banner',
    fields: [
      { name: 'scriptText', label: 'Script Text (e.g. Experience Our)' },
      { name: 'displayTitle', label: 'Display Title (e.g. STORES)' },
      { name: 'buttonText', label: 'Button Text' },
      { name: 'buttonLink', label: 'Button Link' },
    ],
  },
];

const BannerCard = ({ config, initialData, canEdit = true }) => {
  const [texts, setTexts] = useState(initialData?.texts || {});
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveTexts = async () => {
    setSaving(true);
    try {
      const res = await bannerAPI.updateTexts(config.key, texts);
      if (res.success) showMsg('success', 'Text saved successfully');
      else showMsg('error', res.message || 'Failed to save');
    } catch {
      showMsg('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await bannerAPI.uploadImage(config.key, file);
      if (res.success) {
        setImageUrl(res.data.imageUrl);
        showMsg('success', 'Image uploaded successfully');
      } else {
        showMsg('error', res.message || 'Upload failed');
      }
    } catch {
      showMsg('error', 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleResetImage = async () => {
    if (!window.confirm('Reset to default image?')) return;
    setResetting(true);
    try {
      const res = await bannerAPI.resetImage(config.key);
      if (res.success) {
        setImageUrl(null);
        showMsg('success', 'Image reset to default');
      } else {
        showMsg('error', res.message || 'Reset failed');
      }
    } catch {
      showMsg('error', 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Image size={18} className="text-[#6B1E1E]" />
          <span className="font-body font-semibold text-gray-900">{config.label}</span>
          {imageUrl && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-body">Custom Image</span>
          )}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {open && (
        <div className="p-5 space-y-5 bg-white">
          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}>
              {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          {/* Image section */}
          <div>
            <p className="font-body text-sm font-medium text-gray-700 mb-3">Banner Image</p>
            <div className="flex flex-wrap items-center gap-3">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={config.label}
                  className="w-32 h-20 object-cover rounded border border-gray-200"
                />
              ) : (
                <div className="w-32 h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
                  <span className="font-body text-xs text-gray-400">Default image</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || !canEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 font-body text-sm"
                >
                  <Upload size={15} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleResetImage}
                    disabled={resetting || !canEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-body text-sm"
                  >
                    <RotateCcw size={15} />
                    {resetting ? 'Resetting...' : 'Reset to Default'}
                  </button>
                )}
              </div>
            </div>
            <p className="font-body text-xs text-gray-500 mt-2">Accepted: JPG, PNG, WebP · Max: 5MB</p>
          </div>

          {/* Text fields */}
          <div>
            <p className="font-body text-sm font-medium text-gray-700 mb-3">Banner Text</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="block font-body text-xs text-gray-500 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={texts[field.name] || ''}
                    onChange={(e) => setTexts((p) => ({ ...p, [field.name]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent font-body text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSaveTexts}
              disabled={saving || !canEdit}
              className="mt-4 flex items-center gap-2 px-5 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 font-body text-sm"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Text'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoModal, setPromoModal] = useState(null); // null | 'new' | promo object
  const [promoMsg, setPromoMsg] = useState(null);
  const [settings, setSettings] = useState({
    siteName: 'Shree Diya',
    supportEmail: 'divyashreefashion2025@gmail.com',
    orderNotifications: true,
    userNotifications: true,
    inventoryAlerts: true,
    lowStockThreshold: 5,
    enableRegistration: true,
    requireEmailVerification: true
  });
  const [saving, setSaving] = useState(false);
  const [bannerData, setBannerData] = useState({});
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [canEditBanners, setCanEditBanners] = useState(false);

  useEffect(() => {
    api.get('/admin/permissions/my')
      .then((res) => {
        const perms = res.data?.data?.permissions;
        if (perms?.banners?.view) setCanEditBanners(!!perms?.banners?.edit);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'coupons' && promos.length === 0) {
      setLoadingPromos(true);
      api.get('/admin/promos')
        .then((res) => { if (res.data?.success) setPromos(res.data.data); })
        .catch(() => {})
        .finally(() => setLoadingPromos(false));
    }
  }, [activeTab]);

  const showPromoMsg = (type, text) => {
    setPromoMsg({ type, text });
    setTimeout(() => setPromoMsg(null), 3000);
  };

  const handleSavePromo = async (form) => {
    try {
      const isEdit = promoModal && typeof promoModal === 'object' && promoModal._id;
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      };
      if (isEdit) {
        const res = await api.put(`/admin/promos/${promoModal._id}`, payload);
        if (res.data?.success) {
          setPromos((p) => p.map((pr) => (pr._id === promoModal._id ? res.data.data : pr)));
          showPromoMsg('success', 'Coupon updated');
        }
      } else {
        const res = await api.post('/admin/promos', payload);
        if (res.data?.success) {
          setPromos((p) => [res.data.data, ...p]);
          showPromoMsg('success', 'Coupon created');
        }
      }
      setPromoModal(null);
    } catch (err) {
      showPromoMsg('error', err?.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/promos/${promoId}`);
      setPromos((p) => p.filter((pr) => pr._id !== promoId));
      showPromoMsg('success', 'Coupon deleted');
    } catch {
      showPromoMsg('error', 'Failed to delete coupon');
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      const res = await api.put(`/admin/promos/${promo._id}`, { isActive: !promo.isActive });
      if (res.data?.success) {
        setPromos((p) => p.map((pr) => (pr._id === promo._id ? res.data.data : pr)));
      }
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'banners' && Object.keys(bannerData).length === 0) {
      setLoadingBanners(true);
      bannerAPI.adminGetAll()
        .then((res) => {
          if (res.success) {
            const map = {};
            res.data.forEach((b) => { map[b.key] = b; });
            setBannerData(map);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingBanners(false));
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully');
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'banners', label: 'Banners' },
    { id: 'coupons', label: 'Coupons' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Settings</h1>
        <p className="font-body text-gray-600 mt-1">Manage your application settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 font-body text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#6B1E1E] text-[#6B1E1E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Database size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Site Name</label>
                <input type="text" name="siteName" value={settings.siteName} onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent" />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Support Email</label>
                <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 flex items-center gap-2 font-body font-medium">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">Notification Settings</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'orderNotifications', label: 'Order Notifications', desc: 'Receive notifications for new orders' },
                { name: 'userNotifications', label: 'User Notifications', desc: 'Receive notifications for new user registrations' },
                { name: 'inventoryAlerts', label: 'Inventory Alerts', desc: 'Receive alerts for low stock items' },
              ].map((item) => (
                <label key={item.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-body text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="font-body text-xs text-gray-600">{item.desc}</p>
                  </div>
                  <input type="checkbox" name={item.name} checked={settings[item.name]} onChange={handleChange}
                    className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]" />
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">Inventory Settings</h3>
            </div>
            <div>
              <label className="font-body text-sm font-medium text-gray-700">Low Stock Threshold</label>
              <input type="number" name="lowStockThreshold" value={settings.lowStockThreshold} onChange={handleChange} min="0"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent" />
              <p className="font-body text-xs text-gray-600 mt-1">Alert when product stock falls below this number</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 flex items-center gap-2 font-body font-medium">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Image size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">Banner Management</h3>
            </div>
            <p className="font-body text-sm text-gray-500 mb-6">
              Customize the text and images for each banner displayed on the homepage.
              Click a banner to expand and edit it.
            </p>
            {!canEditBanners && (
              <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
                <p className="font-body text-sm text-yellow-700">You have view-only access to banners. Contact a superadmin to enable editing.</p>
              </div>
            )}

            {loadingBanners ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1E1E]"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {BANNER_CONFIGS.map((config) => (
                  <BannerCard
                    key={config.key}
                    config={config}
                    initialData={bannerData[config.key]}
                    canEdit={canEditBanners}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          {promoModal !== null && (
            <PromoFormModal
              initial={typeof promoModal === 'object' && promoModal._id
                ? {
                    ...promoModal,
                    discountValue: String(promoModal.discountValue),
                    minOrderAmount: promoModal.minOrderAmount ? String(promoModal.minOrderAmount) : '',
                    maxDiscountAmount: promoModal.maxDiscountAmount ? String(promoModal.maxDiscountAmount) : '',
                    maxUses: promoModal.maxUses ? String(promoModal.maxUses) : '',
                    expiresAt: promoModal.expiresAt ? new Date(promoModal.expiresAt).toISOString().slice(0, 16) : '',
                  }
                : null}
              onSave={handleSavePromo}
              onClose={() => setPromoModal(null)}
            />
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag size={20} className="text-gray-600" />
                <h3 className="font-display text-lg font-semibold">Coupon Management</h3>
              </div>
              <button
                type="button"
                onClick={() => setPromoModal('new')}
                className="flex items-center gap-2 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] font-body text-sm"
              >
                <Plus size={16} />
                New Coupon
              </button>
            </div>
            <p className="font-body text-sm text-gray-500 mb-5">
              Create promo codes for customers to get discounts at checkout.
            </p>

            {promoMsg && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body mb-4 ${promoMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {promoMsg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
                {promoMsg.text}
              </div>
            )}

            {loadingPromos ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1E1E]"></div>
              </div>
            ) : promos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Tag size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-body text-sm">No coupons yet. Create your first one!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Code</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Discount</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Min Order</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Uses</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Expires</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {promos.map((promo) => (
                      <tr key={promo._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-[#6B1E1E] bg-[#6B1E1E]/10 px-2 py-0.5 rounded text-xs">
                            {promo.code}
                          </span>
                          {promo.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{promo.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}%${promo.maxDiscountAmount ? ` (max ₹${promo.maxDiscountAmount})` : ''}`
                            : `₹${promo.discountValue}`}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {promo.minOrderAmount > 0 ? `₹${promo.minOrderAmount}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {promo.usedCount}{promo.maxUses ? ` / ${promo.maxUses}` : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(promo)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >
                            {promo.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPromoModal(promo)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePromo(promo._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={20} className="text-gray-600" />
              <h3 className="font-display text-lg font-semibold">User Management</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'enableRegistration', label: 'Enable Registration', desc: 'Allow new users to register' },
                { name: 'requireEmailVerification', label: 'Require Email Verification', desc: 'Users must verify their email before accessing the site' },
              ].map((item) => (
                <label key={item.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-body text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="font-body text-xs text-gray-600">{item.desc}</p>
                  </div>
                  <input type="checkbox" name={item.name} checked={settings[item.name]} onChange={handleChange}
                    className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]" />
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 flex items-center gap-2 font-body font-medium">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
