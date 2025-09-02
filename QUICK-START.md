# 🚀 Quick Setup Reference

## Step-by-Step Setup Process

### 1️⃣ Backend Setup (5 minutes)
```powershell
cd d:\Server-arct1cx\epub-reader-backend
npm install
cp .env.example .env
npm run dev  # Should show "EPUB Reader Backend running on port 3001"
```

### 2️⃣ Frontend Setup (5 minutes)
```powershell
cd d:\GitHubDesktop\repository\EPUB-reader\epub-reader
npm install
npm start  # Should open browser at http://localhost:3000
```

### 3️⃣ Test Local Integration (2 minutes)
- ✅ Backend health check: http://localhost:3001/api/health
- ✅ Frontend loads: http://localhost:3000
- ✅ Try uploading an EPUB file in the frontend
- ✅ Try searching for books (will show mock results)

### 4️⃣ Deploy Backend to Render (Production) 
1. **Copy backend to repository:**
   ```powershell
   cp -r d:\Server-arct1cx\epub-reader-backend d:\GitHubDesktop\repository\EPUB-reader\backend
   cd d:\GitHubDesktop\repository\EPUB-reader
   git add backend/
   git commit -m "Add backend for deployment"
   git push origin main
   ```

2. **Create Render Web Service:**
   - Go to [render.com](https://render.com)
   - New + → Web Service → Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables in Render:**
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://arct1cx.github.io
   ```

4. **Add Backend URL to GitHub Secrets:**
   - Repository Settings → Secrets → Actions
   - Add `BACKEND_URL` = `https://your-render-service.onrender.com/api`

### 5️⃣ GitHub Pages Setup (3 minutes)
1. **Enable GitHub Pages:**
   - Go to: https://github.com/arCt1cX/EPUB-reader/settings/pages
   - Source: Select "GitHub Actions"

2. **Deploy:**
   ```powershell
   git add .
   git commit -m "Initial EPUB reader setup"
   git push origin main
   ```

### 6️⃣ Final Testing
- ✅ Local: http://localhost:3000 (with backend on 3001)
- ✅ Production: https://arct1cx.github.io/EPUB-reader (with Render backend)

## 🔧 Configuration Files to Check

### Backend Environment (d:\Server-arct1cx\epub-reader-backend\.env)
```env
EPUB_PORT=3001
FRONTEND_URL=http://localhost:3000,https://arct1cx.github.io
```

### Frontend Package.json (Already configured)
```json
{
  "homepage": "https://arct1cx.github.io/EPUB-reader"
}
```

## 🎯 URLs After Setup

| Service | Local Development | Production |
|---------|------------------|------------|
| Frontend | http://localhost:3000 | https://arct1cx.github.io/EPUB-reader |
| Backend | http://localhost:3001 | Your backend URL |
| Health Check | http://localhost:3001/api/health | Your-backend/api/health |

## ⚡ Quick Commands

```powershell
# Start both services (2 terminals)
# Terminal 1 (Backend)
cd d:\Server-arct1cx\epub-reader-backend && npm run dev

# Terminal 2 (Frontend)
cd d:\GitHubDesktop\repository\EPUB-reader\epub-reader && npm start

# Deploy to GitHub Pages
git add . && git commit -m "Update" && git push origin main

# Check if services are running
curl http://localhost:3001/api/health
```

## 🚨 Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| CORS error | Check backend .env FRONTEND_URL |
| 404 API error | Ensure backend is running on port 3001 |
| Build fails | Run `npm cache clean --force` |
| GitHub Pages 404 | Check homepage in package.json |

## 📱 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Can upload EPUB files
- [ ] Search shows mock results
- [ ] Settings save and load
- [ ] GitHub Actions deployment works
- [ ] Production site loads

---

**Need help?** Check the full [SETUP.md](./SETUP.md) guide for detailed instructions.
