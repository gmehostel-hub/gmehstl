# Frontend Deployment Guide

## Prerequisites
- Node.js (v16+)
- npm or yarn
- Vercel account (free tier available)

## 1. Prepare Frontend for Production

1. **Update API Endpoint**
   - Edit `.env.production` to point to your backend URL
   ```
   REACT_APP_API_URL=https://gmehostel.onrender.com
   ```

2. **Build the Project**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

## 2. Deploy to Vercel (Recommended)

### Option A: Vercel Dashboard (Easiest)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://gmehostel.onrender.com`)
6. Click "Deploy"

### Option B: Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Login:
   ```bash
   vercel login
   ```
3. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

## 3. Configure Custom Domain (Optional)
1. In Vercel Dashboard:
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your domain (e.g., `app.yourdomain.com`)
2. Update DNS settings with your domain registrar

## 4. Post-Deployment
1. Test all functionality
2. Verify API connections
3. Check console for errors

## 5. Environment Variables
For local development, use `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

For production, use `.env.production`:
```
REACT_APP_API_URL=https://gmehostel.onrender.com
```

## Troubleshooting
- **Build Failures**: Check the build logs in Vercel
- **CORS Issues**: Ensure your backend allows requests from your frontend domain
- **Environment Variables**: Verify all required variables are set in Vercel
