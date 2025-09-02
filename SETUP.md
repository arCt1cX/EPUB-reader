# EPUB Reader Setup & Deployment Guide

This guide will walk you through setting up the EPUB Reader PWA with proper frontend-backend integration and GitHub Actions deployment.

## 📋 Prerequisites

- Node.js (v16 or higher)
- Git
- GitHub account
- Your existing `d:\Server-arct1cx` server

## 🔧 Part 1: Backend Setup

### Step 1: Install Backend Dependencies
```powershell
# Navigate to your existing server folder
cd d:\Server-arct1cx\epub-reader-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure Backend Environment
Edit the `.env` file in `d:\Server-arct1cx\epub-reader-backend\.env`:

```env
# Server configuration
EPUB_PORT=3001
NODE_ENV=development

# Frontend URL for CORS (update this when deploying)
FRONTEND_URL=http://localhost:3000

# For production, add your GitHub Pages URL:
# FRONTEND_URL=https://arct1cx.github.io

# Rate limiting
MAX_REQUESTS_PER_MINUTE=60
DOWNLOAD_TIMEOUT_SECONDS=30
```

### Step 3: Test Backend
```powershell
# Start the backend server
npm run dev

# Test the API endpoints:
# http://localhost:3001/api/health
# http://localhost:3001/api/search?q=test
```

## 🎨 Part 2: Frontend Setup

### Step 1: Install Frontend Dependencies
```powershell
# Navigate to the frontend folder
cd d:\GitHubDesktop\repository\EPUB-reader\epub-reader

# Install dependencies
npm install
```

### Step 2: Configure Frontend API URL
You need to update the frontend to point to your backend. Edit `src/utils/indexedDB.js`:

**For Local Development:**
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

**For Production (when backend is deployed):**
```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

### Step 3: Test Frontend
```powershell
# Start the frontend (backend should be running)
npm start

# App will be available at http://localhost:3000
```

## 🔗 Part 3: Linking Frontend & Backend

### Option A: Local Development
1. **Start Backend**: `cd d:\Server-arct1cx\epub-reader-backend && npm run dev`
2. **Start Frontend**: `cd d:\GitHubDesktop\repository\EPUB-reader\epub-reader && npm start`
3. **Both servers run simultaneously**: Backend on port 3001, Frontend on port 3000

### Option B: Deploy Backend to Your Server
If you have a live server, you can deploy the backend there:

1. **Upload backend files** to your server
2. **Install dependencies** on server: `npm install`
3. **Set environment variables** for production
4. **Start backend**: `npm start`
5. **Update frontend API URL** to point to your live backend

## 🚀 Part 4: GitHub Actions Setup

### Step 1: Enable GitHub Pages
1. Go to your repository: `https://github.com/arCt1cX/EPUB-reader`
2. Click **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**

### Step 2: Configure Repository Secrets (if needed)
If your backend requires API keys:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add any required secrets (API keys, etc.)

### Step 3: Update Frontend for Production
Create a production build configuration. Edit `src/utils/indexedDB.js`:

```javascript
// Determine API URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-backend-url.com/api'  // Replace with your backend URL
  : 'http://localhost:3001/api';
```

### Step 4: Update Backend CORS for Production
Edit your backend `.env` file:

```env
# For production, allow your GitHub Pages domain
FRONTEND_URL=https://arct1cx.github.io
```

Or for multiple environments:
```env
# Allow both local and production
FRONTEND_URL=http://localhost:3000,https://arct1cx.github.io
```

Then update your backend CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Step 5: Deploy Frontend
```powershell
# In the frontend directory
cd d:\GitHubDesktop\repository\EPUB-reader\epub-reader

# Commit and push your changes
git add .
git commit -m "Configure frontend for production"
git push origin main
```

The GitHub Action will automatically:
1. Install dependencies
2. Build the React app
3. Deploy to GitHub Pages
4. Your app will be available at: `https://arct1cx.github.io/EPUB-reader`

## 🔧 Part 5: Backend Deployment Options

### Option 1: Keep Backend Local (Development Only)
- Backend runs only on your local machine
- Frontend deployed to GitHub Pages will have limited functionality
- Good for testing frontend features

### Option 2: Deploy Backend to Cloud Service
Popular options:
- **Heroku**: Easy deployment with git
- **Railway**: Simple Node.js hosting
- **Vercel**: Serverless functions
- **DigitalOcean**: VPS hosting

### Option 3: Integrate with Your Existing Server
If you have a live server running your other projects:

1. **Upload the epub-reader-backend folder** to your server
2. **Configure your main server** to proxy requests to the EPUB backend
3. **Update nginx/apache configuration** if needed

Example nginx configuration:
```nginx
location /api/epub/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 📝 Part 6: Testing the Complete Setup

### Local Testing Checklist:
- [ ] Backend starts without errors on port 3001
- [ ] Frontend starts without errors on port 3000
- [ ] Health check works: `http://localhost:3001/api/health`
- [ ] Search API responds: `http://localhost:3001/api/search?q=test`
- [ ] Frontend can communicate with backend
- [ ] EPUB upload works in frontend
- [ ] Settings are saved and restored

### Production Testing Checklist:
- [ ] GitHub Pages deployment succeeds
- [ ] Frontend loads at GitHub Pages URL
- [ ] Backend is accessible from production URL
- [ ] CORS is properly configured
- [ ] All frontend features work in production

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Update backend CORS configuration
   - Check FRONTEND_URL environment variable

2. **API Not Found (404)**
   - Verify backend is running
   - Check API_BASE_URL in frontend

3. **Build Fails**
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`

4. **GitHub Pages 404**
   - Ensure homepage is set correctly in package.json
   - Check if GitHub Pages is enabled

### Debug Commands:
```powershell
# Check backend status
curl http://localhost:3001/api/health

# Check frontend build
cd epub-reader && npm run build

# View GitHub Actions logs
# Go to repository → Actions tab → Click on latest workflow
```

## 🎯 Next Steps

1. **Complete local setup** following Parts 1-3
2. **Test everything locally** before deploying
3. **Choose backend deployment option** (Part 5)
4. **Deploy frontend** using GitHub Actions (Part 4)
5. **Configure production URLs** and test live deployment

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs for API errors
4. Verify environment variables are set correctly

Remember to update API URLs when switching between development and production environments!
