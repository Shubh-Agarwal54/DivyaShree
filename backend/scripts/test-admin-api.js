// Test script to verify admin API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAdminAccess() {
  try {
    console.log('=== TESTING ADMIN API ACCESS ===\n');

    // Step 1: Login with superadmin
    console.log('1. Logging in with superadmin account...');
    const loginResponse = await axios.post(`${BASE_URL}/user/login`, {
      email: 'divyashreefashion2025@gmail.com',
      password: 'your_password_here' // Replace with actual password
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful!');
    console.log('   User:', user.firstName, user.lastName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Token:', token.substring(0, 20) + '...\n');

    // Step 2: Test /permissions/my endpoint
    console.log('2. Testing /admin/permissions/my endpoint...');
    try {
      const permissionsResponse = await axios.get(`${BASE_URL}/admin/permissions/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (permissionsResponse.data.success) {
        console.log('✅ Permissions fetched successfully!');
        console.log('   Role:', permissionsResponse.data.data.role);
        console.log('   Permissions:', JSON.stringify(permissionsResponse.data.data.permissions, null, 2));
      }
    } catch (error) {
      console.log('❌ Failed to fetch permissions');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
    }

    console.log('\n3. Testing /admin/dashboard endpoint...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (dashboardResponse.data.success) {
        console.log('✅ Dashboard accessed successfully!');
      }
    } catch (error) {
      console.log('❌ Failed to access dashboard');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }

    console.log('\n=== TEST COMPLETE ===\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
console.log('⚠️  Please update the password in this script before running!\n');
testAdminAccess();
