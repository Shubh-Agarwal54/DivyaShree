# MongoDB Connection Troubleshooting

## ❌ Current Issue: Authentication Failed

The error `bad auth : Authentication failed` means MongoDB Atlas credentials are incorrect or user permissions are wrong.

---

## 🔧 Solution Options

### Option 1: Fix MongoDB Atlas Credentials (Recommended)

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com/

2. **Navigate to Database Access**
   - Left sidebar → Database Access

3. **Check User Credentials**
   - Username: `divyashreefashion2025_db_user`
   - Click "Edit" on the user

4. **Reset Password**
   - Click "Edit Password"
   - Generate new password or set custom one
   - **IMPORTANT**: Copy the new password

5. **Ensure User Has Permissions**
   - Role: `Atlas Admin` or `Read and write to any database`
   - Click "Update User"

6. **Update `.env` File**
   ```env
   MONGODB_URI=mongodb+srv://divyashreefashion2025_db_user:NEW_PASSWORD_HERE@divyashree.pctopk7.mongodb.net/divyashree?retryWrites=true&w=majority
   ```
   
   Replace `NEW_PASSWORD_HERE` with your actual password

7. **Special Characters in Password?**
   If password has special characters, URL-encode them:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`
   - `?` → `%3F`
   - `#` → `%23`
   - `[` → `%5B`
   - `]` → `%5D`
   - `%` → `%25`

---

### Option 2: Create New Database User

1. **MongoDB Atlas → Database Access → Add New Database User**

2. **User Details:**
   - Username: `divyashree_admin`
   - Password: Generate or create strong password (save it!)
   - Database User Privileges: `Atlas Admin` or `Read and write to any database`

3. **Update `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://divyashree_admin:YOUR_NEW_PASSWORD@divyashree.pctopk7.mongodb.net/divyashree?retryWrites=true&w=majority
   ```

---

### Option 3: Get Connection String from Atlas

1. **MongoDB Atlas → Database → Connect**

2. **Choose: Connect your application**

3. **Driver: Node.js, Version: 5.5 or later**

4. **Copy Connection String:**
   ```
   mongodb+srv://<username>:<password>@divyashree.pctopk7.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace Placeholders:**
   - `<username>` → Your username
   - `<password>` → Your password
   - Add database name after `.net/`: `/divyashree`

6. **Final Format:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@divyashree.pctopk7.mongodb.net/divyashree?retryWrites=true&w=majority
   ```

---

### Option 4: Network Access Check

1. **MongoDB Atlas → Network Access**

2. **Check IP Whitelist:**
   - Should have `0.0.0.0/0` (Allow access from anywhere)
   - OR your current IP address

3. **If Not Listed:**
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)
   - Click "Confirm"

---

### Option 5: Use Local MongoDB (Development Only)

If you want to test without MongoDB Atlas:

1. **Install MongoDB Locally**
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt install mongodb`

2. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   mongod
   ```

3. **Update `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/divyashree
   ```

4. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

---

## ✅ Verify Connection

After fixing, backend should show:
```
✅ MongoDB Connected: divyashree.pctopk7.mongodb.net
🚀 Server running on port 5000
```

---

## 🧪 Test Connection Manually

Create `backend/test-connection.js`:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Wrong username or password');
    console.error('2. User not added to database');
    console.error('3. IP address not whitelisted');
    console.error('4. Network connection issues');
    process.exit(1);
  }
};

testConnection();
```

Run test:
```bash
cd backend
node test-connection.js
```

---

## 📋 Quick Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Database user exists with correct username
- [ ] Password is correct (no typos)
- [ ] Special characters in password are URL-encoded
- [ ] User has `Read and write to any database` permission
- [ ] IP address is whitelisted (0.0.0.0/0 for dev)
- [ ] Connection string has database name: `/divyashree`
- [ ] `.env` file is in `backend/` folder
- [ ] Backend restarted after `.env` changes

---

## 🆘 Still Having Issues?

### Check MongoDB Atlas Status
- Visit: https://status.mongodb.com/
- Ensure no ongoing incidents

### Try Different Connection Format
```env
# Format 1 (with authSource)
MONGODB_URI=mongodb+srv://username:password@divyashree.pctopk7.mongodb.net/divyashree?retryWrites=true&w=majority&authSource=admin

# Format 2 (with options)
MONGODB_URI=mongodb+srv://username:password@divyashree.pctopk7.mongodb.net/divyashree?retryWrites=true&w=majority&ssl=true

# Format 3 (Standard connection - no SRV)
MONGODB_URI=mongodb://username:password@divyashree-shard-00-00.pctopk7.mongodb.net:27017,divyashree-shard-00-01.pctopk7.mongodb.net:27017,divyashree-shard-00-02.pctopk7.mongodb.net:27017/divyashree?ssl=true&replicaSet=atlas-xxx&authSource=admin&retryWrites=true&w=majority
```

---

## 💡 Recommended Solution

**The easiest fix:**

1. Go to MongoDB Atlas
2. Database Access → Edit your user
3. Click "Edit Password"
4. Select "Autogenerate Secure Password"
5. **Copy the password shown**
6. Update `.env` with new password
7. Restart backend: `npm run dev`

This ensures no typos and no special character issues!

---

**Once MongoDB connects, the green checkmark will appear! ✅**
