# MongoDB Atlas Setup Guide

This guide will help you migrate from local MongoDB to MongoDB Atlas cloud database.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account or log in if you already have one
3. Create a new project (e.g., "Hostel Management System")

## Step 2: Create a Cluster

1. Click "Build a Database" or "Create Cluster"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "hostel-cluster")
5. Click "Create Cluster"

## Step 3: Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Create a username and strong password
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

**Important:** Save these credentials securely - you'll need them for the connection string.

## Step 4: Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add only specific IP addresses
5. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver and version "4.1 or later"
5. Copy the connection string

## Step 6: Update Environment Variables

1. Open `backend/.env` file
2. Replace the placeholders in the MONGODB_URI with your actual credentials:

```bash
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.xxxxx.mongodb.net/hostel-management?retryWrites=true&w=majority
```

**Example:**
```bash
MONGODB_URI=mongodb+srv://admin:mypassword123@hostel-cluster.ab1cd.mongodb.net/hostel-management?retryWrites=true&w=majority
```

## Step 7: Test Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console for "MongoDB connected successfully" message

## Step 8: Seed Initial Data (Optional)

If you need to populate your Atlas database with initial data:

```bash
cd backend
npm run seed
```

## Security Best Practices

1. **Never commit credentials to version control**
2. Use strong passwords for database users
3. Restrict IP access in production
4. Regularly rotate database passwords
5. Monitor database access logs

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Double-check username and password
   - Ensure special characters in password are URL-encoded

2. **Connection Timeout**
   - Verify IP address is whitelisted
   - Check network connectivity

3. **Database Not Found**
   - MongoDB Atlas will create the database automatically when first accessed
   - Ensure database name matches in connection string

### URL Encoding Special Characters

If your password contains special characters, encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

## Migration Complete!

Your application is now configured to use MongoDB Atlas. The cloud database provides:
- Automatic backups
- High availability
- Global distribution
- Built-in security features
- Performance monitoring
