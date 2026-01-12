# DivyaShree Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

---

## 1. AUTHENTICATION APIs

### 1.1 Register User

**POST** `/user/register`

Create a new user account.

**Request Body:**
```json
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "email": "priya@example.com",
  "password": "password123",
  "phone": "+91 98765 43210"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "65a1234567890abcdef12345",
      "firstName": "Priya",
      "lastName": "Sharma",
      "email": "priya@example.com",
      "phone": "+91 98765 43210",
      "role": "user",
      "isBlocked": false,
      "addresses": [],
      "wishlist": [],
      "createdAt": "2025-01-06T10:30:00.000Z",
      "updatedAt": "2025-01-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Email already registered

---

### 1.2 Login User

**POST** `/user/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials or blocked account

---

## 2. USER PROFILE APIs

**🔒 All endpoints require authentication**

### 2.1 Get User Profile

**GET** `/user/profile`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65a1234567890abcdef12345",
    "firstName": "Priya",
    "lastName": "Sharma",
    "email": "priya@example.com",
    "phone": "+91 98765 43210",
    "role": "user",
    "isBlocked": false,
    "addresses": [...],
    "wishlist": [...],
    "createdAt": "2025-01-06T10:30:00.000Z"
  }
}
```

---

### 2.2 Update User Profile

**PUT** `/user/profile`

Headers:
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Priya",
  "lastName": "Kumar",
  "phone": "+91 99999 88888"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

**Note:** Only `firstName`, `lastName`, and `phone` can be updated.

---

## 3. ADDRESS APIs

**🔒 All endpoints require authentication**

### 3.1 Get All Addresses

**GET** `/user/addresses`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1234567890abcdef12346",
      "type": "Home",
      "name": "Priya Sharma",
      "address": "123, MG Road, Koramangala",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "phone": "+91 98765 43210",
      "isDefault": true
    }
  ]
}
```

---

### 3.2 Add New Address

**POST** `/user/addresses`

Headers:
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "Home",
  "name": "Priya Sharma",
  "address": "123, MG Road, Koramangala",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "phone": "+91 98765 43210"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "65a1234567890abcdef12346",
    "type": "Home",
    ...
    "isDefault": false
  }
}
```

**Valid Address Types:** `Home`, `Office`, `Other`

---

### 3.3 Update Address

**PUT** `/user/addresses/:addressId`

Headers:
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Priya Kumar",
  "phone": "+91 99999 88888"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": { ... }
}
```

---

### 3.4 Delete Address

**DELETE** `/user/addresses/:addressId`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

**Note:** If deleted address was default, first remaining address becomes default.

---

### 3.5 Set Default Address

**PATCH** `/user/addresses/:addressId/default`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Default address updated successfully"
}
```

---

## 4. WISHLIST APIs

**🔒 All endpoints require authentication**

### 4.1 Get Wishlist

**GET** `/user/wishlist`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    "65a1234567890abcdef12347",
    "65a1234567890abcdef12348"
  ]
}
```

**Note:** Returns array of product IDs. Use with product API to get full details.

---

### 4.2 Add to Wishlist

**POST** `/user/wishlist`

Headers:
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "65a1234567890abcdef12347"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Added to wishlist",
  "data": [...]
}
```

**Error:** `409 Conflict` if product already in wishlist

---

### 4.3 Remove from Wishlist

**DELETE** `/user/wishlist/:productId`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Removed from wishlist",
  "data": [...]
}
```

---

## 5. ORDER APIs

**🔒 All endpoints require authentication**

### 5.1 Create Order

**POST** `/orders`

Headers:
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "65a1234567890abcdef12347",
      "name": "Royal Maroon Lehenga",
      "price": 12999,
      "quantity": 1,
      "image": "https://example.com/image.jpg",
      "size": "M",
      "color": "Maroon",
      "category": "Lehengas"
    }
  ],
  "shippingAddress": {
    "name": "Priya Sharma",
    "address": "123, MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "+91 98765 43210"
  },
  "paymentMethod": "cod",
  "paymentDetails": {
    "upiId": "priya@upi",
    "cardLastFour": "4567"
  },
  "subtotal": 12999,
  "shipping": 0,
  "tax": 650,
  "total": 13649
}
```

**Payment Methods:** `cod`, `upi`, `card`, `netbanking`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "65a1234567890abcdef12349",
    "userId": "65a1234567890abcdef12345",
    "orderNumber": "DS12345678",
    "items": [...],
    "shippingAddress": {...},
    "paymentMethod": "cod",
    "subtotal": 12999,
    "shipping": 0,
    "tax": 650,
    "total": 13649,
    "status": "confirmed",
    "createdAt": "2025-01-06T11:00:00.000Z"
  }
}
```

**Order Number Format:** `DS` + last 8 digits of timestamp

---

### 5.2 Get User Orders

**GET** `/orders`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1234567890abcdef12349",
      "orderNumber": "DS12345678",
      "items": [...],
      "total": 13649,
      "status": "confirmed",
      "createdAt": "2025-01-06T11:00:00.000Z"
    }
  ]
}
```

**Note:** Orders sorted by creation date (newest first)

---

### 5.3 Get Order Details

**GET** `/orders/:orderId`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65a1234567890abcdef12349",
    "orderNumber": "DS12345678",
    "items": [...],
    "shippingAddress": {...},
    "paymentMethod": "cod",
    "subtotal": 12999,
    "shipping": 0,
    "tax": 650,
    "total": 13649,
    "status": "confirmed",
    "createdAt": "2025-01-06T11:00:00.000Z"
  }
}
```

---

### 5.4 Track Order

**GET** `/orders/track/:orderNumber`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orderNumber": "DS12345678",
    "status": "shipped",
    "items": [...],
    ...
  }
}
```

**Order Statuses:**
- `pending`: Payment pending
- `confirmed`: Order confirmed
- `processing`: Being prepared
- `shipped`: Out for delivery
- `delivered`: Successfully delivered
- `cancelled`: Order cancelled

---

### 5.5 Cancel Order

**PATCH** `/orders/:orderId/cancel`

Headers:
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": { ... }
}
```

**Error:** `400 Bad Request` if order already delivered or cancelled

---

## 6. ADMIN ORDER APIs

**🔒 Requires authentication + admin role**

### 6.1 Get All Orders (Admin)

**GET** `/orders/admin/all`

Headers:
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1234567890abcdef12349",
      "userId": {
        "_id": "65a1234567890abcdef12345",
        "firstName": "Priya",
        "lastName": "Sharma",
        "email": "priya@example.com"
      },
      "orderNumber": "DS12345678",
      "total": 13649,
      "status": "confirmed",
      ...
    }
  ]
}
```

**Note:** Includes user details with each order

---

### 6.2 Update Order Status (Admin)

**PATCH** `/orders/admin/:orderId/status`

Headers:
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Statuses:** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": { ... }
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

---

## Authentication Flow

1. **Register/Login** → Get JWT token
2. **Store token** in frontend (localStorage/sessionStorage)
3. **Include token** in all protected API requests:
   ```
   Authorization: Bearer <your_token>
   ```
4. **Token expires** after 7 days → Re-login required

---

## Error Handling

All errors include descriptive messages:

```json
{
  "success": false,
  "message": "User-friendly error message"
}
```

In development mode, additional error details are included.

---

## Rate Limiting

Consider implementing rate limiting in production:
- Login: 5 attempts per 15 minutes
- API calls: 100 requests per minute per IP

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <your_token>"
```

---

## Support

For issues or questions:
- Check error messages in API responses
- Verify token is valid and not expired
- Ensure request body matches required format
- Check MongoDB connection if database errors occur
