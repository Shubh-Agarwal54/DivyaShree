// Script to initialize default role permissions in the database
const mongoose = require('mongoose');
const RolePermission = require('../src/modules/admin/role-permission.model');
require('dotenv').config();

const initializePermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/divyashree');

    console.log('Connected to MongoDB');

    // Create default permissions
    await RolePermission.createDefaultPermissions();

    console.log('✅ Default role permissions initialized successfully');
    console.log('\nCreated/Updated roles:');
    console.log('- superadmin: Full access to all features');
    console.log('- masteradmin: Access to most features');
    console.log('- subadmin: Limited access');
    console.log('- admin: Basic admin access');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing permissions:', error);
    process.exit(1);
  }
};

initializePermissions();
