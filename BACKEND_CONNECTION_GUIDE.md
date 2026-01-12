# Backend Connection Guide

## ✅ Backend & Frontend Connection Setup Complete!

### What Was Fixed:

1. **MongoDB Connection**
   - ✅ Removed deprecated options (`useNewUrlParser`, `useUnifiedTopology`)
   - ✅ Added database name to MongoDB URI
   - ✅ Fixed connection string format

2. **Frontend API Integration**
   - ✅ Created `/src/services/api.js` with all API methods
   - ✅ Updated `AuthContext.jsx` to use real backend APIs
   - ✅ Updated `Login.jsx` with async auth & error handling
   - ✅ Updated `Signup.jsx` with async auth & error handling
   - ✅ Added loading states and error messages
   - ✅ Created `.env` file with API URL

---

## 🚀 How to Start Both Backend & Frontend

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected: divyashree.pctopk7.mongodb.net
🚀 Server running on port 5000
📍 Environment: development
🌐 API: http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔗 Connection Flow

```
Frontend (localhost:5173)
    ↓
API Service (/src/services/api.js)
    ↓
Backend API (localhost:5000/api)
    ↓
MongoDB Atlas (Cloud Database)
```

---

## 🧪 Test the Connection

### 1. Open Frontend
```
http://localhost:5173
```

### 2. Go to Signup Page
```
http://localhost:5173/signup
```

### 3. Register a New User
- Fill in all fields
- Click "Create Account"
- Should redirect to Account page on success
- Check browser DevTools Console for any errors

### 4. Test Login
- Go to `/login`
- Use the email/password you just registered
- Should login successfully

### 5. Check Backend Logs
Backend terminal should show:
```
POST /api/user/register 201 xxx ms
POST /api/user/login 200 xxx ms
GET /api/user/profile 200 xxx ms
```

---

## 📁 Files Modified

### Backend:
1. `backend/src/config/db.js` - Removed deprecated options
2. `backend/.env` - Added database name to MongoDB URI

### Frontend:
1. `frontend/src/services/api.js` - **NEW** - All API methods
2. `frontend/src/context/AuthContext.jsx` - Connected to backend
3. `frontend/src/pages/Login.jsx` - Async auth + error handling
4. `frontend/src/pages/Signup.jsx` - Async auth + error handling
5. `frontend/.env` - **NEW** - API URL configuration

---

## 🔐 What's Working Now

✅ **User Registration**
- POST `/api/user/register`
- Creates user in MongoDB
- Returns JWT token
- Stores token in localStorage

✅ **User Login**
- POST `/api/user/login`
- Validates credentials
- Returns JWT token
- Stores user data & token

✅ **Auto-Login**
- Checks localStorage on app load
- Verifies token with backend
- Loads user profile

✅ **Protected Routes**
- Token included in API requests
- User redirected if not authenticated

---

## 🛠️ API Endpoints Available

All endpoints in `frontend/src/services/api.js`:

### User APIs
- `userAPI.register(userData)`
- `userAPI.login(email, password)`
- `userAPI.getProfile()`
- `userAPI.updateProfile(updates)`

### Address APIs
- `addressAPI.getAddresses()`
- `addressAPI.addAddress(addressData)`
- `addressAPI.updateAddress(id, updates)`
- `addressAPI.deleteAddress(id)`
- `addressAPI.setDefaultAddress(id)`

### Wishlist APIs
- `wishlistAPI.getWishlist()`
- `wishlistAPI.addToWishlist(productId)`
- `wishlistAPI.removeFromWishlist(productId)`

### Order APIs
- `orderAPI.createOrder(orderData)`
- `orderAPI.getUserOrders()`
- `orderAPI.getOrderById(id)`
- `orderAPI.trackOrder(orderNumber)`
- `orderAPI.cancelOrder(id)`

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error
**Solution:**
- Check `.env` file has correct MongoDB URI
- Verify MongoDB Atlas credentials
- Check network/firewall
- Try: `ping divyashree.pctopk7.mongodb.net`

### Issue: Frontend Can't Connect to Backend
**Solution:**
- Ensure backend is running on port 5000
- Check frontend `.env` has `VITE_API_URL=http://localhost:5000/api`
- Restart frontend after changing `.env`
- Check CORS in backend allows `http://localhost:5173`

### Issue: CORS Error
**Solution:**
Backend `.env` should have:
```
FRONTEND_URL=http://localhost:5173
```

### Issue: 401 Unauthorized
**Solution:**
- Token expired (7 days) - Login again
- Check token in localStorage: `divyashree_token`
- Verify token is sent in Authorization header

### Issue: Changes Not Reflecting
**Solution:**
```bash
# Restart frontend (Ctrl+C then)
npm run dev

# Restart backend (Ctrl+C then)
npm run dev
```

---

## 📊 Check Connection Status

### Browser DevTools (F12)

**Console Tab:**
- Should NOT see CORS errors
- Should NOT see network errors
- Login/Signup should log success

**Network Tab:**
- Filter: `user`
- Check POST requests to `/api/user/register` or `/api/user/login`
- Status should be 200 or 201
- Response should have `success: true`

**Application Tab → Local Storage:**
- Should see `divyashree_user` (user data)
- Should see `divyashree_token` (JWT token)

---

## 🎉 Success Indicators

✅ Backend shows: `✅ MongoDB Connected`
✅ Frontend loads without errors
✅ Can register new user
✅ Can login with credentials
✅ Redirects to Account page
✅ Token stored in localStorage
✅ No CORS errors in console

---

## 📞 Next Steps

1. **Test All Auth Features**
   - Register → Login → Logout → Login again

2. **Integrate Other Contexts** (Optional)
   - Update AddressContext to use `addressAPI`
   - Update CartContext → OrderAPI for checkout

3. **Production Deployment**
   - Backend: Railway/Heroku/Render
   - Frontend: Vercel/Netlify
   - Update `VITE_API_URL` to production URL

---

## 🔑 Important Notes

- **JWT Token**: Expires after 7 days
- **Password**: Hashed with bcrypt (never stored plain)
- **MongoDB**: Cloud database (no local MongoDB needed)
- **CORS**: Backend allows frontend domain
- **Environment Variables**: 
  - Backend: `.env` (MongoDB URI, JWT secret)
  - Frontend: `.env` (API URL)

---

**Everything is now connected and ready to use! 🚀**
