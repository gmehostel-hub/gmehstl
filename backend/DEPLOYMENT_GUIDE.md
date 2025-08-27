# Hostel Management System - Deployment Guide

This guide will help you deploy the Hostel Management System backend and frontend to production.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account
- Vercel account (for frontend)
- Render account (for backend)

## Backend Deployment (Render)

1. **Prepare your repository**
   - Ensure all changes are committed and pushed to your Git repository
   - Make sure your `.env` file is properly configured

2. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" and select "Web Service"
   - Connect your GitHub/GitLab repository
   - Configure the service:
     - **Name**: gmehostel-backend (or your preferred name)
     - **Region**: Choose the closest to your users
     - **Branch**: main (or your production branch)
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
   - Add environment variables from your `.env` file
   - Click "Create Web Service"

3. **Configure Environment Variables in Render**
   - In your Render dashboard, go to your service
   - Click on "Environment"
   - Add/update the following variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_secure_jwt_secret
     # ... other environment variables ...
     CORS_ORIGINS=https://your-frontend-domain.com
     FRONTEND_URL=https://your-frontend-domain.com
     ```

## Frontend Deployment (Vercel)

1. **Prepare your frontend**
   - In your frontend directory, update `.env.production`:
     ```
     REACT_APP_API_URL=https://your-render-backend-url.onrender.com
     ```
   - Commit and push your changes

2. **Deploy to Vercel**
   - Push your code to GitHub/GitLab
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Import your frontend repository
   - Configure the project:
     - **Framework Preset**: Create React App
     - **Build Command**: `npm run build` or `yarn build`
     - **Output Directory**: build
     - **Install Command**: `npm install` or `yarn`
   - Add environment variables:
     - `REACT_APP_API_URL`: https://your-render-backend-url.onrender.com
   - Click "Deploy"

## Environment Variables Reference

### Backend (.env)

```
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=15
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your_session_secret

# CORS & Frontend
CORS_ORIGINS=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Email
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=your-email@gmail.com
```

## Post-Deployment

1. **Verify Backend**
   ```bash
   curl https://your-render-backend-url.onrender.com/api/health
   ```
   Should return a 200 status with server status.

2. **Test Authentication**
   - Try registering a new user
   - Test login functionality
   - Verify protected routes

3. **Monitor Logs**
   - Check Render dashboard for any errors
   - Monitor Vercel logs for frontend issues

## Troubleshooting

- **CORS Issues**: Ensure CORS_ORIGINS is correctly set and includes your frontend URL
- **Database Connection**: Verify MONGODB_URI is correct and the database is accessible
- **Environment Variables**: Double-check all required variables are set in production
- **Port Binding**: Ensure the PORT environment variable is set and not in use

## Security Notes

- Never commit sensitive data (passwords, API keys) to version control
- Use strong, unique secrets for JWT and sessions
- Enable HTTPS for all services
- Regularly update dependencies to patch security vulnerabilities
