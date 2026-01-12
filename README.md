# 👗 DivyaShree Fashion E-Commerce Platform

A full-stack e-commerce platform for Indian ethnic wear with authentication, cart, wishlist, and order management.

## 🚀 Deployment Status

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas

## 📋 Quick Setup for Production

### ✅ Frontend (Vercel)

1. **Already Created**: `vercel.json` file to handle SPA routing
2. **Set Environment Variable in Vercel**:
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - **Important**: Replace `your-backend` with your actual Render service name
3. **Redeploy**: Go to Deployments → Click "..." → "Redeploy"

### ✅ Backend (Render)

1. **Set Environment Variables in Render**:
   - Go to: Render Dashboard → Your Service → Environment
   - Add these variables (see `.env.example` for reference):
     ```
     NODE_ENV=production
     BACKEND_URL=https://your-backend.onrender.com
     FRONTEND_URL=https://your-frontend.vercel.app
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_random_secret
     SESSION_SECRET=your_secure_random_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_gmail_app_password
     SMS_API_KEY=62e7f2e09
     SMS_API_URL=https://sms.renflair.in
     ```
   - Service will auto-redeploy after saving

### ✅ Google OAuth Setup

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Authorized JavaScript origins** - Add:
   ```
   https://your-frontend.vercel.app
   https://your-backend.onrender.com
   ```
3. **Authorized redirect URIs** - Add:
   ```
   https://your-backend.onrender.com/api/user/auth/google/callback
   ```
   ⚠️ **Note**: Must point to BACKEND, not frontend
4. **Save** and wait 5-10 minutes for changes to propagate

## 🛠️ Local Development

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Gmail account (for email OTPs)
- Google OAuth credentials

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

## 📦 Features

- ✅ User Authentication (Email/Password + Google OAuth)
- ✅ Email & SMS OTP Verification
- ✅ Shopping Cart & Wishlist
- ✅ Order Management
- ✅ Address Management
- ✅ Product Catalog
- ✅ Responsive Design

## 🐛 Troubleshooting

### Frontend Shows 404 on Vercel
✅ **Fixed**: Added `vercel.json` with SPA rewrite rules

### Google OAuth Not Working
- Ensure `BACKEND_URL` and `FRONTEND_URL` are set in Render
- Verify redirect URIs in Google Console point to Render backend
- Check CORS allows your Vercel frontend

### CORS Errors
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check backend logs for "CORS blocked origin" messages

## 📚 Documentation

- See `backend/API_DOCUMENTATION.md` for API endpoints
- See `AUTHENTICATION_GUIDE.md` for auth flow details
- See `.env.example` files for environment variable references

## 🔗 Links

- Frontend: https://divya-shree-three.vercel.app
- Backend: https://divyashree.onrender.com
- API Health: https://divyashree.onrender.com/health

---

Built with ❤️ using React, Express, MongoDB, and Passport.js