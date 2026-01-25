# Storage Migration Setup Guide

This guide will help you set up the storage migration system for the gym tracker app.

## Prerequisites

- Node.js 22+ installed
- PostgreSQL database running
- Expo CLI for React Native development

## Backend Setup

### Step 1: Install Dependencies

```bash
cd server
npm install bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
```

### Step 2: Verify Environment Variables

Check that your `.env` file contains:

```bash
DATABASE_URL="postgresql://david@localhost/gymtracker?host=/var/run/postgresql&schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-please"
```

> ⚠️ **Important**: Change the JWT_SECRET to a strong, random string in production!

### Step 3: Run Database Migration

```bash
# Create and apply migration
npx prisma migrate dev --name add-user-auth

# Generate Prisma Client with new User model
npx prisma generate
```

### Step 4: Verify Migration

Check that the migration was successful:

```bash
# View database schema
npx prisma studio
```

You should see the new `User` table and updated `Routine` and `Workout` tables with `userId` fields.

### Step 5: Start the Server

```bash
npm run dev
```

The server should start on port 3000 with the new auth routes available.

## Client Setup

### Step 1: Update App.tsx

Wrap your app with the new providers:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { StorageProvider } from './src/contexts/StorageContext';
// ... other imports

export default function App() {
  return (
    <AuthProvider>
      <StorageProvider>
        <NavigationContainer>
          {/* Your existing navigation */}
        </NavigationContainer>
      </StorageProvider>
    </AuthProvider>
  );
}
```

### Step 2: Update Existing Screens

Replace direct API calls with storage provider:

**Before:**
```typescript
import { fetchRoutines } from '../api/client';

const routines = await fetchRoutines();
```

**After:**
```typescript
import { useStorage } from '../contexts/StorageContext';

const { storageProvider } = useStorage();
const routines = await storageProvider.getRoutines();
```

## Testing the Implementation

### Test 1: User Registration

```bash
# Using curl
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Expected response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "uuid",
#     "email": "test@example.com",
#     "name": "Test User"
#   }
# }
```

### Test 2: User Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test 3: Protected Route

```bash
# Get routines (requires auth)
curl -X GET http://localhost:3000/routines \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Data Sync

```bash
# Upload data to cloud
curl -X POST http://localhost:3000/sync/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "routines": [],
    "workouts": []
  }'

# Download data from cloud
curl -X GET http://localhost:3000/sync/download \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Issue: "Cannot find module 'bcrypt'"

**Solution:**
```bash
cd server
npm install bcrypt jsonwebtoken
```

### Issue: "Property 'user' does not exist on type 'PrismaClient'"

**Solution:**
```bash
npx prisma generate
```

This regenerates the Prisma Client with the new User model.

### Issue: "JWT_SECRET is not defined"

**Solution:**
Add to your `.env` file:
```
JWT_SECRET="your-secret-key-here"
```

### Issue: Migration fails with foreign key constraint

**Solution:**
If you have existing data, you may need to:
1. Backup your data
2. Drop the database and recreate it
3. Run migrations on fresh database
4. Restore data (assign to a default user)

### Issue: "Authentication required" on all routes

**Solution:**
Make sure you're sending the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Next Steps

1. **Create UI Screens**:
   - Login screen
   - Registration screen
   - Settings screen with storage mode toggle

2. **Update Existing Screens**:
   - Replace all API calls with `storageProvider` methods
   - Add loading states for sync operations

3. **Add Error Handling**:
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Implement retry logic for failed syncs

4. **Test Migration Flow**:
   - Create data in local mode
   - Switch to cloud mode
   - Verify data appears in cloud
   - Switch back to local
   - Verify data downloads correctly

## Migration Checklist

- [ ] Backend dependencies installed
- [ ] JWT_SECRET added to .env
- [ ] Database migration completed
- [ ] Prisma Client regenerated
- [ ] Server starts without errors
- [ ] Auth endpoints working (register/login)
- [ ] Protected routes require authentication
- [ ] Sync endpoints working (upload/download)
- [ ] Client providers added to App.tsx
- [ ] Existing screens updated to use storageProvider
- [ ] Login/Register screens created
- [ ] Settings screen with storage toggle created
- [ ] Local mode tested
- [ ] Cloud mode tested
- [ ] Migration local→cloud tested
- [ ] Migration cloud→local tested

## Support

If you encounter any issues not covered here, check:
1. Server logs for detailed error messages
2. Network tab in React Native Debugger
3. AsyncStorage contents using React Native Debugger
4. Database contents using Prisma Studio

Good luck with your storage migration! 🚀
