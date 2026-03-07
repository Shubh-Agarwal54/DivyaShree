import { useState, useEffect, useRef } from 'react';
import { Save, Mail, Bell, Shield, Database, Image, ChevronDown, ChevronUp, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { bannerAPI } from '@/services/api';
import api from '@/services/axios';

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
