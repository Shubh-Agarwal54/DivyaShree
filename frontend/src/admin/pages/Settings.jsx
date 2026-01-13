import { useState } from 'react';
import { Save, Mail, Bell, Shield, Database } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'DivyaShree',
    supportEmail: 'support@divyashree.com',
    orderNotifications: true,
    userNotifications: true,
    inventoryAlerts: true,
    lowStockThreshold: 5,
    enableRegistration: true,
    requireEmailVerification: true
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Settings</h1>
        <p className="font-body text-gray-600 mt-1">Manage your application settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database size={20} className="text-gray-600" />
            <h3 className="font-display text-lg font-semibold">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={20} className="text-gray-600" />
            <h3 className="font-display text-lg font-semibold">Notification Settings</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-body text-sm font-medium text-gray-900">Order Notifications</p>
                <p className="font-body text-xs text-gray-600">Receive notifications for new orders</p>
              </div>
              <input
                type="checkbox"
                name="orderNotifications"
                checked={settings.orderNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]"
              />
            </label>
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-body text-sm font-medium text-gray-900">User Notifications</p>
                <p className="font-body text-xs text-gray-600">Receive notifications for new user registrations</p>
              </div>
              <input
                type="checkbox"
                name="userNotifications"
                checked={settings.userNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]"
              />
            </label>
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-body text-sm font-medium text-gray-900">Inventory Alerts</p>
                <p className="font-body text-xs text-gray-600">Receive alerts for low stock items</p>
              </div>
              <input
                type="checkbox"
                name="inventoryAlerts"
                checked={settings.inventoryAlerts}
                onChange={handleChange}
                className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]"
              />
            </label>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-gray-600" />
            <h3 className="font-display text-lg font-semibold">Inventory Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium text-gray-700">Low Stock Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B1E1E] focus:border-transparent"
              />
              <p className="font-body text-xs text-gray-600 mt-1">
                Alert when product stock falls below this number
              </p>
            </div>
          </div>
        </div>

        {/* User Management Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail size={20} className="text-gray-600" />
            <h3 className="font-display text-lg font-semibold">User Management</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-body text-sm font-medium text-gray-900">Enable Registration</p>
                <p className="font-body text-xs text-gray-600">Allow new users to register</p>
              </div>
              <input
                type="checkbox"
                name="enableRegistration"
                checked={settings.enableRegistration}
                onChange={handleChange}
                className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]"
              />
            </label>
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div>
                <p className="font-body text-sm font-medium text-gray-900">Require Email Verification</p>
                <p className="font-body text-xs text-gray-600">Users must verify their email before accessing the site</p>
              </div>
              <input
                type="checkbox"
                name="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={handleChange}
                className="w-5 h-5 text-[#6B1E1E] border-gray-300 rounded focus:ring-[#6B1E1E]"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-body font-medium"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
