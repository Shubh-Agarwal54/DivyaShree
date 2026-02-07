# Admin Panel Access - Troubleshooting Guide

## ✅ ISSUE FIXED!

### The Problem
The admin panel showed a blank white screen with the error:
```
Uncaught Error: Rendered more hooks than during the previous render
```

### Root Causes
1. **React Hooks Violation**: Early return before all hooks were called in AdminLayout
2. **Auth Loading State**: AdminLayout wasn't waiting for AuthContext to load user from localStorage

### The Fixes Applied

#### Fix 1: Moved auth check inside useEffect
**Before:**
```javascript
// ❌ Early return before hooks
if (!user || !['admin', ...].includes(user.role)) {
  navigate('/login');
  return null;
}
useEffect(() => { ... }, []);
```

**After:**
```javascript
// ✅ All hooks called first
useEffect(() => {
  if (!user || !['admin', ...].includes(user.role)) {
    navigate('/login');
    return;
  }
}, [user]);
```

#### Fix 2: Added auth loading check
```javascript
const { user, logout, loading: authLoading } = useAuth();

// Wait for auth to load before checking user
if (authLoading) {
  return <LoadingSpinner />;
}
```

## 🚀 How to Access Admin Panel

### 1. URLs
- Frontend: http://localhost:8082
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:8082/admin

### 2. Login Credentials
- Email: divyashreefashion2025@gmail.com
- Role: superadmin
- Password: [your password]

### 3. Steps to Access
1. Clear browser cache (Ctrl + Shift + Delete)
2. Go to: http://localhost:8082/login
3. Login with superadmin credentials
4. You will be redirected to homepage
5. Navigate to: http://localhost:8082/admin
6. You should now see the admin dashboard!

## 🔍 Verification Steps

### Verify Database Setup
```bash
cd backend
node scripts/check-superadmin.js
```

This should show:
- ✅ 1 superadmin user found
- ✅ 4 role configurations (superadmin, masteradmin, subadmin, admin)

### Check Console Logs
Open browser DevTools (F12) → Console tab. You should see:
```
AdminLayout - Waiting for auth to load...
AdminLayout - User: {firstName: "Prasoon", ...}
AdminLayout - User Role: superadmin
AdminLayout - User authorized, fetching permissions
Fetching permissions from /admin/permissions/my
Permissions response: {success: true, data: {...}}
```

## 🛠️ Troubleshooting

### Issue: Still seeing white screen

**Solution 1: Clear browser cache**
```
Ctrl + Shift + Delete → Clear cached images and files
```

**Solution 2: Check if you're logged in**
- Open DevTools → Application → Local Storage
- Check for `divyashree_token` and `divyashree_user`
- If missing, login again

**Solution 3: Verify backend is running**
```bash
cd backend
npm run dev
```

**Solution 4: Check console for errors**
- Open DevTools → Console
- Look for red error messages
- Share screenshot if errors persist

### Issue: "Access denied" error

**Check your role:**
```bash
cd backend
node scripts/check-superadmin.js
```

If your user doesn't have superadmin role, update it in MongoDB:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "superadmin" } }
)
```

### Issue: Permissions not loading

**Re-initialize permissions:**
```bash
cd backend
npm run init-permissions
```

## 📱 Testing Different Roles

To test different admin roles:

1. **Create Test Admin Users** (via MongoDB or API)
2. **Set Different Roles:**
   - `superadmin`: Full access
   - `masteradmin`: Most features
   - `subadmin`: Limited access
   - `admin`: Basic access

3. **Login with different accounts** to see different menus

## 🎯 Expected Behavior

### Superadmin Menu Items:
- ✅ Dashboard
- ✅ Users
- ✅ Orders
- ✅ Products
- ✅ Inventory
- ✅ Analytics
- ✅ Role Permissions
- ✅ Settings

### Subadmin Menu Items:
- ✅ Dashboard
- ✅ Users (view only)
- ✅ Orders
- ✅ Products
- ✅ Inventory (view only)
- ❌ Analytics
- ❌ Role Permissions
- ❌ Settings

## 📊 API Endpoints Test

Test if backend is working:

### Get My Permissions
```bash
# Replace TOKEN with your actual token
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/permissions/my
```

Expected response:
```json
{
  "success": true,
  "data": {
    "role": "superadmin",
    "permissions": {
      "dashboard": { "view": true },
      ...
    }
  }
}
```

## 🔐 Security Notes

1. **Only superadmin** can modify role permissions
2. **Menu items auto-hide** based on user permissions
3. **API endpoints protected** with permission middleware
4. **All changes logged** in audit trail

## 📝 Files Changed

### Backend
- `backend/src/modules/admin/role-permission.model.js` ✨ NEW
- `backend/src/modules/admin/inventory.controller.js` ✨ NEW
- `backend/src/modules/admin/role-permission.controller.js` ✨ NEW
- `backend/src/middlewares/permission.middleware.js` ✨ NEW
- `backend/src/modules/user/user.model.js` ✏️ UPDATED
- `backend/src/modules/admin/admin.routes.js` ✏️ UPDATED
- `backend/scripts/init-permissions.js` ✨ NEW
- `backend/scripts/check-superadmin.js` ✨ NEW

### Frontend
- `frontend/src/admin/pages/InventoryManagement.jsx` ✨ NEW
- `frontend/src/admin/pages/RolePermissions.jsx` ✨ NEW
- `frontend/src/admin/AdminLayout.jsx` ✏️ FIXED
- `frontend/src/App.jsx` ✏️ UPDATED

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 8082
- [ ] Permissions initialized in database
- [ ] Superadmin user exists
- [ ] Can access http://localhost:8082/login
- [ ] Can login with superadmin credentials
- [ ] Can access http://localhost:8082/admin
- [ ] See admin dashboard with all menu items
- [ ] Can access Inventory page
- [ ] Can access Role Permissions page

## 🆘 Still Need Help?

If you're still having issues:

1. **Share console logs** (F12 → Console tab)
2. **Share network errors** (F12 → Network tab)
3. **Run:** `node scripts/check-superadmin.js` and share output
4. **Check if ports are correct:** Backend should be on 5000, Frontend on 8082

---

**Last Updated:** February 7, 2026
**Status:** ✅ RESOLVED
