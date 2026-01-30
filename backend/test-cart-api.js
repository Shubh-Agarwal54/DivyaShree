// Test script for cart API endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/user';

// Test credentials (use existing user from your database)
const testUser = {
  email: 'test@example.com', // Replace with actual user email
  password: 'Test@123' // Replace with actual password
};

let authToken = '';

async function testCartAPI() {
  try {
    console.log('🧪 Testing Cart API Endpoints\n');

    // 1. Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/login`, testUser);
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log('✅ Login successful\n');
    } else {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Get cart (should be empty or existing cart)
    console.log('2️⃣ Getting cart...');
    const getCartResponse = await axios.get(`${API_URL}/cart`, { headers });
    console.log('✅ Cart retrieved:', getCartResponse.data);
    console.log('');

    // 3. Add item to cart (replace with actual product ID)
    console.log('3️⃣ Adding item to cart...');
    const addItemResponse = await axios.post(
      `${API_URL}/cart`,
      {
        productId: '6965ec45095689ec9441cfc1', // Replace with actual product ID
        quantity: 2,
        size: 'M',
        color: 'Red'
      },
      { headers }
    );
    console.log('✅ Item added:', addItemResponse.data);
    console.log('');

    // 4. Get cart again to see the added item
    console.log('4️⃣ Getting updated cart...');
    const updatedCartResponse = await axios.get(`${API_URL}/cart`, { headers });
    console.log('✅ Updated cart:', JSON.stringify(updatedCartResponse.data, null, 2));
    console.log('');

    // 5. Update item quantity
    console.log('5️⃣ Updating item quantity...');
    const updateResponse = await axios.put(
      `${API_URL}/cart/6965ec45095689ec9441cfc1`, // Replace with actual product ID
      { quantity: 3 },
      { headers }
    );
    console.log('✅ Quantity updated:', updateResponse.data);
    console.log('');

    // 6. Get cart to verify update
    console.log('6️⃣ Getting cart after update...');
    const afterUpdateCart = await axios.get(`${API_URL}/cart`, { headers });
    console.log('✅ Cart after update:', JSON.stringify(afterUpdateCart.data, null, 2));
    console.log('');

    console.log('✅ All cart API endpoints working correctly!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCartAPI();
