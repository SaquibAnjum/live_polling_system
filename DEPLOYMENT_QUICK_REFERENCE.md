# Quick Deployment Reference Card

## 🚀 Fast Deployment Steps

### Backend → Render (5 minutes)

1. **Sign up**: https://render.com → GitHub login
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. **Environment Variables**:
   ```
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key-32-chars-min
   TEACHER_PASSWORD=teacher123
   CORS_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
5. **Deploy** → Copy URL

### Frontend → Vercel (3 minutes)

1. **Sign up**: https://vercel.com → GitHub login
2. **Import Project** → Select repo
3. **Settings**:
   - Root Directory: `frontend`
   - Framework: Vite (auto)
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. **Deploy** → Copy URL

### Update CORS (1 minute)

1. Render → Environment → Update `CORS_ORIGIN` to Vercel URL
2. Wait for redeploy

---

## 🔗 Your URLs

- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-frontend.vercel.app`
- **Health Check**: `https://your-backend.onrender.com/health`

---

## ✅ Test Checklist

- [ ] Backend `/health` returns OK
- [ ] Frontend loads Welcome page
- [ ] Teacher can login
- [ ] Student can join
- [ ] Real-time updates work
- [ ] Socket.IO connected (check console)
- [ ] No CORS errors

---

**Full Guide**: See `COMPLETE_DEPLOYMENT_GUIDE.md`

