# Hostel Management System - Deployment Guide

## Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account
- Domain name (optional but recommended)
- Hosting provider account (Render, Railway, or AWS)

## 1. Production Environment Setup

### 1.1 Update Environment Variables
1. Copy `.env.production` to `.env` in the backend directory
2. Update all placeholder values with your production credentials
3. Never commit `.env` or `.env.production` to version control

### 1.2 Update CORS Configuration
Ensure your frontend URL is included in `CORS_ORIGINS` in `.env.production`

## 2. Database Setup (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster if you haven't already
3. Set up a database user with read/write access
4. Add your production server's IP to the IP whitelist
5. Update `MONGODB_URI` in your `.env.production`

## 3. Backend Deployment

### Option A: Deploy to Render (Recommended)
1. Push your code to a GitHub/GitLab repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - Name: `hostel-management-backend`
   - Region: Choose closest to your users
   - Branch: `main` or your production branch
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Add environment variables from your `.env.production`
7. Click "Create Web Service"

### Option B: Deploy to Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. Run `railway login`
3. Run `railway init`
4. Run `railway up`
5. Set environment variables using `railway env`

## 4. Frontend Deployment

### Using Vercel (Recommended)
1. Push your frontend code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your frontend repository
5. Configure:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add environment variables
7. Deploy

## 5. Domain Configuration

1. Purchase a domain (if you haven't already)
2. Set up DNS records:
   - A record: `@` → your server IP
   - CNAME: `www` → your-domain.com
   - CNAME: `api` → your-backend-url.onrender.com (or your hosting provider)
3. Enable HTTPS/SSL (usually automatic on most platforms)

## 6. Post-Deployment

1. Test all API endpoints
2. Verify CORS is working
3. Set up monitoring (Uptime Robot, etc.)
4. Configure backups for your database
5. Set up logging (e.g., Winston + Loggly)

## 7. Maintenance

- Regularly update dependencies
- Monitor server resources
- Set up automated backups
- Keep an eye on security updates

## Troubleshooting

### CORS Issues
- Verify `CORS_ORIGINS` includes all necessary domains
- Check browser console for specific error messages
- Ensure HTTPS is used in production

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string credentials
- Ensure the database user has correct permissions

### Performance Issues
- Enable caching where appropriate
- Optimize database queries
- Consider using a CDN for static assets
