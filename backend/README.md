# DivyaShree Backend API

Production-ready backend for DivyaShree E-Commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: User and Admin roles
- **User Management**: Profile, addresses, wishlist
- **Order Management**: Create, track, and manage orders
- **Secure APIs**: Helmet, CORS, and authentication middlewares
- **Modular Architecture**: Clean, scalable folder structure
- **Error Handling**: Comprehensive error handling and validation

## 📁 Folder Structure

```
backend/
└── src/
    ├── modules/
    │   ├── user/
    │   │   ├── user.model.js
    │   │   ├── user.controller.js
    │   │   ├── user.service.js
    │   │   └── user.routes.js
    │   └── order/
    │       ├── order.model.js
    │       ├── order.controller.js
    │       ├── order.service.js
    │       └── order.routes.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   └── role.middleware.js
    ├── config/
    │   └── db.js
    ├── app.js
    └── server.js
```

## 🛠️ Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Setup Environment Variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and configure:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (change to a secure random string)
# - PORT (default: 5000)
# - FRONTEND_URL (your frontend URL)
```

3. **Start MongoDB**
```bash
# Make sure MongoDB is running
# Local: mongod
# Or use MongoDB Atlas cloud database
```

4. **Run the Server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/user/register` | Register new user | No |
| POST | `/api/user/login` | Login user | No |

### User Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |

### Addresses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/addresses` | Get all addresses | Yes |
| POST | `/api/user/addresses` | Add new address | Yes |
| PUT | `/api/user/addresses/:addressId` | Update address | Yes |
| DELETE | `/api/user/addresses/:addressId` | Delete address | Yes |
| PATCH | `/api/user/addresses/:addressId/default` | Set default address | Yes |

### Wishlist

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/wishlist` | Get wishlist | Yes |
| POST | `/api/user/wishlist` | Add to wishlist | Yes |
| DELETE | `/api/user/wishlist/:productId` | Remove from wishlist | Yes |

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | Yes |
| GET | `/api/orders` | Get user orders | Yes |
| GET | `/api/orders/:orderId` | Get order details | Yes |
| GET | `/api/orders/track/:orderNumber` | Track order | Yes |
| PATCH | `/api/orders/:orderId/cancel` | Cancel order | Yes |

### Admin Orders

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/orders/admin/all` | Get all orders | Yes | Admin |
| PATCH | `/api/orders/admin/:orderId/status` | Update order status | Yes | Admin |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token expires after 7 days.

## 📝 Example API Requests

### Register User
```bash
POST /api/user/register
Content-Type: application/json

{
  "firstName": "Priya",
  "lastName": "Sharma",
  "email": "priya@example.com",
  "password": "password123",
  "phone": "+91 98765 43210"
}
```

### Login
```bash
POST /api/user/login
Content-Type: application/json

{
  "email": "priya@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Royal Maroon Lehenga",
      "price": 12999,
      "quantity": 1,
      "image": "image_url",
      "size": "M",
      "color": "Maroon"
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
  "subtotal": 12999,
  "shipping": 0,
  "tax": 650,
  "total": 13649
}
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/divyashree |
| `JWT_SECRET` | JWT signing secret | (change in production) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Blocked User Check**: Prevents blocked users from accessing APIs
- **Helmet.js**: Security headers
- **CORS**: Configured for frontend domain
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error responses

## 📊 Database Models

### User Model
- firstName, lastName, email, password
- phone, role, isBlocked
- addresses (array of address subdocuments)
- wishlist (array of product references)
- timestamps

### Order Model
- userId, orderNumber, items
- shippingAddress, paymentMethod, paymentDetails
- subtotal, shipping, tax, total
- status (pending, confirmed, processing, shipped, delivered, cancelled)
- timestamps

## 🚀 Deployment

### Production Checklist
- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or production database
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up backup strategy

### Deploy to Heroku/Railway/Render
```bash
# Set environment variables
# Deploy using platform CLI or connect GitHub repo
```

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

ISC
