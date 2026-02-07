#!/usr/bin/env node
// Quick script to verify superadmin user setup
const mongoose = require('mongoose');
require('dotenv').config();

const checkSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/divyashree');
    console.log('✅ Connected to MongoDB\n');

    const User = require('../src/modules/user/user.model');
    const RolePermission = require('../src/modules/admin/role-permission.model');

    // Check for superadmin users
    const superAdmins = await User.find({ role: 'superadmin' }).select('firstName lastName email role');
    
    console.log('=== SUPERADMIN USERS ===');
    if (superAdmins.length === 0) {
      console.log('❌ No superadmin users found!\n');
      console.log('To create a superadmin, update an existing admin user:');
      console.log('db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "superadmin" } })\n');
    } else {
      console.log(`✅ Found ${superAdmins.length} superadmin user(s):\n`);
      superAdmins.forEach(admin => {
        console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}\n`);
      });
    }

    // Check role permissions
    console.log('=== ROLE PERMISSIONS ===');
    const permissions = await RolePermission.find().select('roleName description');
    
    if (permissions.length === 0) {
      console.log('❌ No role permissions found!');
      console.log('Run: npm run init-permissions\n');
    } else {
      console.log(`✅ Found ${permissions.length} role configurations:\n`);
      permissions.forEach(perm => {
        console.log(`   - ${perm.roleName}: ${perm.description}`);
      });
    }

    console.log('\n=== SETUP STATUS ===');
    if (superAdmins.length > 0 && permissions.length > 0) {
      console.log('✅ Everything is set up correctly!');
      console.log('You can now login with your superadmin account.\n');
    } else {
      console.log('⚠️  Setup incomplete. Please follow the steps above.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkSuperAdmin();
