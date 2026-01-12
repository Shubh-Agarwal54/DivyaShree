# DivyaShree Authentication System

## Features Implemented

### 🔐 Authentication Features
- ✅ User Registration with Email & Phone
- ✅ Email OTP Verification
- ✅ Phone OTP Verification (SMS via Renflair API)
- ✅ Email/Password Login
- ✅ Google OAuth 2.0 Sign-In
- ✅ Forgot Password
- ✅ Password Reset via Email Link
- ✅ JWT Token-based Authentication
- ✅ Session Management

### 📧 Notification System
- Email OTPs with branded HTML templates
- SMS OTPs via Renflair API
- Password reset emails with secure tokens
- Order confirmation SMS

## API Endpoints

### Public Routes

#### Register
```
POST /api/user/register
Body: {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone: string (optional)
}
Response: {
  success: true,
  message: "Registration successful. Please verify your email and phone.",
  data: {
    userId: string,
    email: string,
    phone: string,
    requiresEmailVerification: boolean,
    requiresPhoneVerification: boolean
  }
}
```

#### Login
```
POST /api/user/login
Body: {
  email: string,
  password: string
}
Response: {
  success: true,
  message: "Login successful",
  data: {
    user: UserObject,
    token: string
  }
}
OR (if email not verified):
{
  success: false,
  requiresVerification: true,
  userId: string,
  message: "Please verify your email. A new OTP has been sent."
}
```

#### Verify Email OTP
```
POST /api/user/verify-email-otp
Body: {
  userId: string,
  otp: string
}
Response: {
  success: true,
  message: "Email verified successfully"
}
```

#### Verify Phone OTP
```
POST /api/user/verify-phone-otp
Body: {
  userId: string,
  otp: string
}
Response: {
  success: true,
  message: "Phone verified successfully. Account fully activated.",
  data: {
    user: UserObject,
    token: string
  }
}
```

#### Resend Email OTP
```
POST /api/user/resend-email-otp
Body: {
  userId: string
}
Response: {
  success: true,
  message: "OTP resent to email"
}
```

#### Resend Phone OTP
```
POST /api/user/resend-phone-otp
Body: {
  userId: string
}
Response: {
  success: true,
  message: "OTP resent to phone"
}
```

#### Forgot Password
```
POST /api/user/forgot-password
Body: {
  email: string
}
Response: {
  success: true,
  message: "Password reset link sent to your email"
}
```

#### Reset Password
```
POST /api/user/reset-password
Body: {
  token: string,
  newPassword: string
}
Response: {
  success: true,
  message: "Password reset successful"
}
```

#### Google OAuth
```
GET /api/user/auth/google
- Redirects to Google OAuth consent screen

GET /api/user/auth/google/callback
- Google callback handler
- Redirects to: FRONTEND_URL/auth/google/success?token=JWT_TOKEN
```

### Protected Routes (Require Authentication Header)
All protected routes require:
```
Headers: {
  Authorization: "Bearer JWT_TOKEN"
}
```

## Frontend Pages

### `/signup`
- User registration form
- Validates email and password
- Supports Google Sign-In
- Redirects to `/verify-otp` after successful registration

### `/verify-otp`
- Two-step verification: Email → Phone
- Auto-focus and paste support for OTP inputs
- Resend OTP with countdown timer (60 seconds)
- Email must be verified before phone verification

### `/login`
- Email/password login
- Supports Google Sign-In
- "Forgot Password?" link
- Redirects to `/verify-otp` if email not verified

### `/forgot-password`
- Enter email to receive password reset link
- Shows success message after sending

### `/reset-password`
- Accessible via email link with token
- Password strength validation
- Show/hide password toggle

### `/auth/google/success`
- Google OAuth callback handler
- Stores token and user data
- Redirects to homepage

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/divyashree

# JWT
JWT_SECRET=your_secret_key

# URLs
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:5000

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS (Renflair)
SMS_API_KEY=62e7f2e090fe150ef8deb4466fdc81b3
SMS_API_URL=https://sms.renflair.in

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session
SESSION_SECRET=your_session_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file with required variables
cp .env.example .env
# Edit .env with your credentials

# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend dev server
npm run dev
```

### 3. Configure Email (Gmail)

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App Passwords
   - Select "Mail" and "Other"
   - Copy the 16-character password
4. Add to backend `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/user/auth/google/callback`
5. Copy Client ID and Client Secret to backend `.env`

### 5. SMS API (Already Configured)
- API Key: `62e7f2e090fe150ef8deb4466fdc81b3`
- Endpoints configured in `backend/src/services/notification.service.js`

## User Flow

### Registration Flow
1. User fills signup form → POST `/api/user/register`
2. Backend creates user with pending verification
3. Backend sends:
   - Email OTP (6 digits, valid 10 minutes)
   - Phone SMS OTP (6 digits, valid 10 minutes)
4. User redirected to `/verify-otp`
5. User enters email OTP → POST `/api/user/verify-email-otp`
6. Email verified, phone OTP section unlocked
7. User enters phone OTP → POST `/api/user/verify-phone-otp`
8. Account fully activated, token issued
9. Redirect to homepage with logged-in state

### Login Flow (Unverified User)
1. User enters email/password → POST `/api/user/login`
2. Backend checks: password valid BUT email not verified
3. Backend generates new OTPs and sends them
4. Response: `{ requiresVerification: true, userId }`
5. Frontend redirects to `/verify-otp`
6. User completes verification (steps 5-9 above)

### Login Flow (Verified User)
1. User enters email/password → POST `/api/user/login`
2. Backend validates credentials
3. Response: `{ success: true, data: { user, token } }`
4. Frontend stores token and user data
5. Redirect to account page

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Frontend redirects to: `http://localhost:5000/api/user/auth/google`
3. Backend redirects to Google consent screen
4. User approves permissions
5. Google redirects to: `/api/user/auth/google/callback`
6. Backend:
   - Finds or creates user with `googleId`
   - Marks email as verified (trusted from Google)
   - Generates JWT token
7. Backend redirects to: `FRONTEND_URL/auth/google/success?token=JWT`
8. Frontend stores token, fetches user profile
9. Redirect to homepage

### Forgot Password Flow
1. User clicks "Forgot Password?" → Navigate to `/forgot-password`
2. User enters email → POST `/api/user/forgot-password`
3. Backend generates secure reset token (SHA256 hash)
4. Backend sends email with reset link: `FRONTEND_URL/reset-password?token=TOKEN`
5. User clicks link in email
6. Frontend shows password reset form
7. User enters new password → POST `/api/user/reset-password`
8. Backend validates token, updates password
9. Success message, redirect to login

## Database Schema Changes

### User Model (`user.model.js`)

```javascript
{
  // Existing fields
  firstName: String,
  lastName: String,
  email: String (unique, required),
  password: String (required if !googleId),
  phone: String,
  role: String (default: 'customer'),
  isBlocked: Boolean (default: false),
  
  // NEW OTP fields
  isEmailVerified: Boolean (default: false),
  isPhoneVerified: Boolean (default: false),
  emailOTP: {
    code: String,
    expiresAt: Date
  },
  phoneOTP: {
    code: String,
    expiresAt: Date
  },
  
  // NEW Password Reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // NEW Google OAuth fields
  googleId: String (unique, sparse),
  googleProfile: {
    displayName: String,
    picture: String
  }
}
```

## Security Features

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens expire in 7 days
- ✅ OTP codes expire in 10 minutes
- ✅ Password reset tokens expire in 1 hour
- ✅ Reset tokens hashed with SHA256
- ✅ CORS configured for specific origins
- ✅ Helmet.js for security headers
- ✅ Express session for OAuth (httpOnly cookies)
- ✅ Password validation (minimum 6 characters)

## Testing

### Test User Registration + OTP
```bash
# Register
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'

# Check email and phone for OTPs
# Verify Email
curl -X POST http://localhost:5000/api/user/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_RESPONSE",
    "otp": "123456"
  }'

# Verify Phone
curl -X POST http://localhost:5000/api/user/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_RESPONSE",
    "otp": "654321"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Forgot Password
```bash
curl -X POST http://localhost:5000/api/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## UI Design

All authentication pages follow the DivyaShree brand theme:
- **Primary Color**: Maroon (#6B1E1E)
- **Accent Color**: Gold (#D4AF37)
- **Background**: Cream (#F5F5DC)
- **Font**: Modern sans-serif with ethnic touch
- **Gradients**: Maroon to darker maroon backgrounds
- **Animations**: Smooth transitions, hover effects
- **Responsive**: Mobile-first design with breakpoints

### CSS Class Naming Convention
All custom styles use `divyashree-` prefix to avoid conflicts:
- `.divyashree-otp-verification-page`
- `.divyashree-forgot-password-container`
- `.divyashree-verify-btn`
- `.divyashree-otp-input`

## Troubleshooting

### CORS Errors
- Ensure backend `.env` has correct `FRONTEND_URL=http://localhost:8080`
- Check CORS configuration in `backend/src/app.js`

### Email Not Sending
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check 2FA is enabled on Google Account
- Review `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### SMS Not Sending
- API Key is pre-configured: `62e7f2e090fe150ef8deb4466fdc81b3`
- Check Renflair API balance/status
- Review network logs in `notification.service.js`

### Google OAuth Not Working
- Verify redirect URI matches Google Console exactly
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Ensure `BACKEND_URL` and `FRONTEND_URL` are correct

### MongoDB Connection Issues
- Start MongoDB service
- Check `MONGODB_URI` in `.env`
- Ensure port 27017 is not blocked

## Next Steps (Optional Enhancements)

- [ ] Email verification reminder system
- [ ] Rate limiting for OTP requests
- [ ] Account lockout after failed login attempts
- [ ] 2FA with authenticator apps (TOTP)
- [ ] SMS verification for password reset
- [ ] Social login (Facebook, Apple)
- [ ] Remember device functionality
- [ ] Login activity logs
- [ ] Email templates customization
- [ ] Multi-language support for notifications

## Support

For issues or questions:
1. Check this README
2. Review console logs (backend and frontend)
3. Test API endpoints with curl/Postman
4. Verify environment variables
5. Check MongoDB connection

---

**Created**: December 2024  
**Status**: Production Ready ✅  
**Version**: 1.0.0
