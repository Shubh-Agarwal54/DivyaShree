# Inventory Management & Role Permissions System

## Overview
This document describes the newly added Inventory Management and Role-Based Access Control (RBAC) features for the DivyaShree Admin Panel.

## Features Added

### 1. Inventory Management System

#### Backend Components
- **Controller**: `backend/src/modules/admin/inventory.controller.js`
  - Get inventory overview with filtering and search
  - Get low stock alerts
  - Update stock quantities (set, add, subtract)
  - Bulk stock updates
  - View inventory history/audit trail

#### API Endpoints
- `GET /api/admin/inventory` - Get inventory overview
- `GET /api/admin/inventory/alerts` - Get low stock alerts
- `PATCH /api/admin/inventory/:productId/stock` - Update product stock
- `POST /api/admin/inventory/bulk-update` - Bulk update stocks
- `GET /api/admin/inventory/:productId/history` - Get stock history

#### Frontend Components
- **Page**: `frontend/src/admin/pages/InventoryManagement.jsx`
  - Dashboard with stock statistics
  - Filterable product list (by category, stock status, search)
  - Stock update modal with add/subtract/set actions
  - Visual stock status indicators
  - Real-time inventory tracking

#### Features
- Track total products, in-stock, low-stock, and out-of-stock items
- Visual alerts for products requiring attention
- Quick stock adjustments with reason logging
- Comprehensive filtering and search capabilities
- Inventory value calculation

### 2. Role-Based Access Control (RBAC)

#### Backend Components
- **Model**: `backend/src/modules/admin/role-permission.model.js`
  - Defines permission structure for all admin roles
  - Default permissions for each role level

- **Controller**: `backend/src/modules/admin/role-permission.controller.js`
  - Manage role permissions
  - View users by role
  - Update user roles
  - Get current user permissions

- **Middleware**: `backend/src/middlewares/permission.middleware.js`
  - `checkPermission(resource, action)` - Verify specific permissions
  - `isAdminRole()` - Verify admin role
  - `isSuperAdmin()` - Verify super admin role

#### User Roles
1. **Super Admin** - Full access to all features
2. **Master Admin** - Access to most features, cannot delete users or modify super admin permissions
3. **Sub Admin** - Limited access (view users, manage orders/products)
4. **Admin** - Basic access (view-only for most features)

#### Permission Resources
- Dashboard
- Users (view, create, edit, delete, block)
- Orders (view, create, edit, delete, updateStatus, cancel)
- Products (view, create, edit, delete, updateStock)
- Inventory (view, manage, lowStockAlerts)
- Analytics (view)
- Settings (view, edit)
- Role Permissions (view, manage)

#### API Endpoints
- `GET /api/admin/permissions` - Get all role permissions
- `GET /api/admin/permissions/my` - Get current user's permissions
- `GET /api/admin/permissions/:roleName` - Get specific role permissions
- `PUT /api/admin/permissions/:roleName` - Update role permissions
- `GET /api/admin/permissions/:roleName/users` - Get users by role
- `PATCH /api/admin/permissions/user/:userId/role` - Update user role
- `POST /api/admin/permissions/initialize` - Initialize default permissions (superadmin only)

#### Frontend Components
- **Page**: `frontend/src/admin/pages/RolePermissions.jsx`
  - Role list with user counts
  - Permission matrix with visual indicators
  - Interactive permission editing
  - User list by role
  - Permission-based UI rendering

- **Updated AdminLayout**: Dynamic menu based on user permissions
  - Menu items show/hide based on user's role permissions
  - Automatic permission fetching on load

## Database Schema Updates

### User Model Changes
```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'subadmin', 'masteradmin', 'superadmin'],
  default: 'user',
}
```

### New RolePermission Model
```javascript
{
  roleName: String,
  permissions: {
    [resource]: {
      [action]: Boolean
    }
  },
  description: String,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  timestamps: true
}
```

## Setup Instructions

### Backend Setup

1. **Initialize Role Permissions**
   ```bash
   cd backend
   node scripts/init-permissions.js
   ```

2. **Update Existing Admin Users** (if needed)
   You can manually update existing admin users in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: 'admin@example.com' },
     { $set: { role: 'superadmin' } }
   )
   ```

3. **Restart Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

No additional setup required. The new routes are already configured in `App.jsx`.

## Usage

### For Super Admins

1. **Initial Setup**
   - Run the initialization script to create default role permissions
   - Assign appropriate roles to existing admin users

2. **Managing Roles**
   - Navigate to Admin Panel → Role Permissions
   - Select a role to view its permissions
   - Click "Edit Permissions" to modify (only available to super admins)
   - Toggle permissions by clicking on them
   - Save changes

3. **Managing Inventory**
   - Navigate to Admin Panel → Inventory
   - View real-time stock levels and statistics
   - Filter by category or stock status
   - Click "Update Stock" on any product
   - Choose action (Add/Subtract/Set)
   - Enter quantity and optional reason
   - Save changes

### For Other Admins

Admin users will only see menu items and features they have permission to access. The UI automatically adapts based on their role.

## Security Considerations

1. **Permission Checks**
   - All API endpoints are protected with permission checks
   - Frontend UI hides features based on permissions
   - Super admin role cannot be assigned except by another super admin

2. **Audit Trail**
   - All stock changes are logged with user ID and reason
   - Role permission changes are tracked
   - User role changes are audited

3. **Database-Level Protection**
   - Role permissions are validated at the database level
   - Enum constraints prevent invalid roles

## CSS Class Naming Convention

To prevent design overlaps, all new CSS classes use unique prefixes:
- Inventory Management: `inventory-*`
- Role Permissions: `roleperm-*`

Examples:
- `inventory-main-title`
- `roleperm-badge-superadmin`
- `inventory-modal-overlay`
- `roleperm-permission-tag`

## API Response Examples

### Get Inventory Overview
```json
{
  "success": true,
  "data": {
    "products": [...],
    "stats": {
      "totalProducts": 150,
      "inStockProducts": 120,
      "lowStockProducts": 20,
      "outOfStockProducts": 10,
      "totalInventoryValue": 5000000
    }
  }
}
```

### Get Role Permissions
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "roleName": "masteradmin",
      "description": "Master Admin with access to most features",
      "permissions": {
        "dashboard": { "view": true },
        "users": { "view": true, "create": true, "edit": true, "delete": false, "block": true },
        ...
      }
    }
  ]
}
```

## Testing

### Test Inventory Management
1. Navigate to `/admin/inventory`
2. Verify stock statistics are displayed
3. Test search functionality
4. Test category filter
5. Test stock update modal
6. Verify stock changes are reflected

### Test Role Permissions
1. Navigate to `/admin/role-permissions`
2. Verify all roles are listed
3. Select a role and view permissions
4. Test permission editing (if super admin)
5. Verify menu items change based on role
6. Test with different role users

## Troubleshooting

### Issue: Permissions not working
**Solution**: Run the initialization script to create default permissions
```bash
node backend/scripts/init-permissions.js
```

### Issue: Admin user can't access any features
**Solution**: Ensure the user's role is set to a valid admin role and permissions are initialized

### Issue: CSS styles overlapping
**Solution**: All new styles use unique prefixes (`inventory-*`, `roleperm-*`) to prevent conflicts

## Future Enhancements

Potential improvements for future iterations:
1. Real-time inventory alerts via email/SMS
2. Automated reorder suggestions based on sales velocity
3. Custom role creation
4. Fine-grained permission templates
5. Bulk user role assignment
6. Permission inheritance
7. Activity dashboard for permission changes
8. Export inventory reports

## Support

For issues or questions, please refer to:
- Backend API Documentation: `backend/API_DOCUMENTATION.md`
- Setup Guide: `backend/SETUP_GUIDE.md`
