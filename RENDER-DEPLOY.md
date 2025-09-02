# 🚀 Render Deployment Guide for EPUB Reader Backend

## Quick Render Deployment (5 minutes)

### Step 1: Prepare Backend for Deployment
```powershell
# Copy backend to your main repository
cp -r d:\Server-arct1cx\epub-reader-backend d:\GitHubDesktop\repository\EPUB-reader\backend

# Commit to Git
cd d:\GitHubDesktop\repository\EPUB-reader
git add backend/
git commit -m "Add backend for Render deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. **Go to [render.com](https://render.com)** and sign in with GitHub
2. **Click "New +"** → **"Web Service"**
3. **Connect Repository**: Select `arCt1cX/EPUB-reader`
4. **Configure Service**:
   - **Name**: `epub-reader-backend`
   - **Root Directory**: `backend` ⚠️ **Important: Make sure this is exactly "backend"**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

> **⚠️ CRITICAL**: If you see "Service Root Directory missing" error, it means the `backend` folder doesn't exist in your repository yet. Complete Step 1 first!

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://arct1cx.github.io` |
| `MAX_REQUESTS_PER_MINUTE` | `60` |
| `DOWNLOAD_TIMEOUT_SECONDS` | `30` |

### Step 4: Deploy and Get URL

1. **Click "Create Web Service"**
2. **Wait for deployment** (2-3 minutes)
3. **Copy your service URL** (e.g., `https://epub-reader-backend.onrender.com`)

### Step 5: Update GitHub Repository

Add your Render URL as a GitHub secret:

1. **Go to**: https://github.com/arCt1cX/EPUB-reader/settings/secrets/actions
2. **Click "New repository secret"**
3. **Name**: `BACKEND_URL`
4. **Value**: `https://your-render-service.onrender.com/api`

### Step 6: Test Your Deployment

```powershell
# Test backend health
curl https://your-render-service.onrender.com/api/health

# Test search endpoint
curl "https://your-render-service.onrender.com/api/search?q=test"
```

### Step 7: Redeploy Frontend

```powershell
# Trigger frontend redeploy with new backend URL
cd d:\GitHubDesktop\repository\EPUB-reader
git commit --allow-empty -m "Trigger redeploy with Render backend"
git push origin main
```

## 🎯 Final URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://arct1cx.github.io/EPUB-reader |
| **Backend** | https://your-render-service.onrender.com |
| **API Health** | https://your-render-service.onrender.com/api/health |

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails on Render**
   - Check if `package.json` has correct `start` script
   - Verify Node.js version compatibility

2. **CORS Errors**
   - Ensure `FRONTEND_URL` environment variable is set correctly
   - Check Render logs for CORS errors

3. **Service Won't Start**
   - Check Render logs in dashboard
   - Verify `PORT` environment variable usage

### Render-Specific Notes:

- **Free Tier**: Service sleeps after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes ~30 seconds
- **Logs**: Available in Render dashboard
- **Auto-Deploy**: Deploys on every push to main branch

## 🔄 Alternative: Manual Render Setup

If you prefer to keep backend separate:

1. **Create new repository** for backend only
2. **Push backend code** to new repo
3. **Connect new repo** to Render
4. **Same deployment steps** as above

This approach keeps your frontend and backend repositories separate, which some developers prefer for organization.

---

**Need help?** Check the Render documentation or the main [SETUP.md](./SETUP.md) guide.
