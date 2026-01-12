# 🚀 Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Quick Start (5 minutes)

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (cross-origin requests)
- helmet (security headers)
- morgan (request logging)
- dotenv (environment variables)

### Step 3: Setup Environment Variables

Create `.env` file in the backend folder:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and configure:

```env
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/divyashree
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/divyashree

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your_super_secret_key_change_this_in_production

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# Mac/Linux
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 5: Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 6: Verify Server is Running

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
📍 Environment: development
🌐 API: http://localhost:5000
```

Test health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "DivyaShree API is running",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

## ✅ Backend is Ready!

---

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Priya",
    "lastName": "Sharma",
    "email": "priya@example.com",
    "password": "password123",
    "phone": "+91 98765 43210"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### 3. Get Profile (Protected Route)
```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Connecting Frontend

Update your frontend to use the backend API:

1. **Base URL:** `http://localhost:5000/api`

2. **Store JWT token** after login/register

3. **Include token** in all protected requests:
   ```javascript
   const response = await fetch('http://localhost:5000/api/user/profile', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

4. **Update AuthContext** to call real APIs instead of localStorage

---

## Folder Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── user.model.js       # User schema
│   │   │   ├── user.service.js     # Business logic
│   │   │   ├── user.controller.js  # Request handlers
│   │   │   └── user.routes.js      # API routes
│   │   └── order/
│   │       ├── order.model.js
│   │       ├── order.service.js
│   │       ├── order.controller.js
│   │       └── order.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification
│   │   └── role.middleware.js      # Role-based access
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── app.js                      # Express app setup
│   └── server.js                   # Server entry point
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── README.md                       # Documentation
└── API_DOCUMENTATION.md            # API reference
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:**
- Check if MongoDB is running: `mongod` or check MongoDB Atlas
- Verify `MONGODB_URI` in `.env`
- Check network/firewall settings

### Issue: Port Already in Use
**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

Or change `PORT` in `.env`

### Issue: JWT Token Invalid
**Solution:**
- Token expired (7 days) - Login again
- Verify `JWT_SECRET` matches between requests
- Check token format: `Bearer <token>`

### Issue: CORS Error from Frontend
**Solution:**
- Update `FRONTEND_URL` in `.env`
- Restart backend server

---

## Development Tips

### Auto-reload on File Changes
```bash
npm run dev  # Uses nodemon
```

### View API Logs
Morgan middleware logs all requests:
```
GET /api/user/profile 200 45.123 ms - 284
POST /api/user/login 200 156.456 ms - 512
```

### Test with Postman
1. Import backend URL: `http://localhost:5000`
2. Create requests for each endpoint
3. Set `Authorization: Bearer <token>` header
4. Test all CRUD operations

### MongoDB GUI Tools
- **MongoDB Compass** (official)
- **Studio 3T**
- **Robo 3T**

View collections:
- `users`: All registered users
- `orders`: All orders

---

## Production Deployment

### 1. Set Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<production_mongodb_uri>
JWT_SECRET=<super_secure_random_string>
FRONTEND_URL=https://your-domain.com
```

### 2. Security Checklist
- ✅ Change `JWT_SECRET` to random string
- ✅ Use HTTPS
- ✅ Enable rate limiting
- ✅ Set up monitoring/logging
- ✅ Configure backup strategy
- ✅ Use environment-specific configs

### 3. Deploy to Cloud Platform

**Heroku:**
```bash
heroku create divyashree-backend
heroku config:set MONGODB_URI=<uri>
heroku config:set JWT_SECRET=<secret>
git push heroku main
```

**Railway/Render:**
- Connect GitHub repo
- Set environment variables
- Deploy automatically

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server (production) |
| `npm run dev` | Start with auto-reload (development) |

---

## API Endpoints Summary

### Public
- POST `/api/user/register` - Register user
- POST `/api/user/login` - Login user

### Protected (User)
- GET `/api/user/profile` - Get profile
- PUT `/api/user/profile` - Update profile
- GET/POST/PUT/DELETE `/api/user/addresses` - Manage addresses
- GET/POST/DELETE `/api/user/wishlist` - Manage wishlist
- GET/POST `/api/orders` - View/create orders
- PATCH `/api/orders/:id/cancel` - Cancel order

### Protected (Admin)
- GET `/api/orders/admin/all` - All orders
- PATCH `/api/orders/admin/:id/status` - Update order status

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full details.

---

## Support

For issues:
1. Check console logs
2. Verify MongoDB connection
3. Test with cURL/Postman
4. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## Next Steps

1. ✅ Backend is running
2. 🔗 Connect frontend to backend APIs
3. 🧪 Test authentication flow
4. 📦 Test order creation
5. 🚀 Deploy to production

**Happy Coding! 🎉**
