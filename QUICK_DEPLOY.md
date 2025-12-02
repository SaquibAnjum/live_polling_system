# Quick Deploy Guide - TL;DR Version

## 🚀 Fastest Path to Deployment

### 1. Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Set Up Environment Files (1 minute)

**Windows (PowerShell):**
```powershell
.\setup-env.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

**Or manually:**
```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd frontend
cp .env.example .env
```

### 3. Configure Backend .env

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=                    # Leave empty for in-memory mode, or add MongoDB Atlas URI
JWT_SECRET=                      # Generate with: node backend/generate-secret.js
TEACHER_PASSWORD=teacher123     # Change this!
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Generate JWT_SECRET:**
```bash
cd backend
node generate-secret.js
```

### 4. Configure Frontend .env

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 5. Test Locally (2 minutes)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and test!

---

## ☁️ Deploy to Production

### Backend → Render (5 minutes)

1. Go to https://render.com → Sign up
2. "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Name**: `intervue-backend`
   - **Root Directory**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
5. Add Environment Variables:
   ```
   PORT=5000
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-secret
   TEACHER_PASSWORD=your-password
   CORS_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
6. Deploy → Copy URL (e.g., `https://xxx.onrender.com`)

### Frontend → Vercel (3 minutes)

1. Go to https://vercel.com → Sign up
2. "Add New..." → "Project"
3. Import GitHub repo
4. Settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
5. Environment Variables:
   ```
   VITE_API_URL=https://xxx.onrender.com
   VITE_SOCKET_URL=https://xxx.onrender.com
   ```
6. Deploy → Copy URL

### Update Backend CORS

Go back to Render → Environment Variables → Update `CORS_ORIGIN` to your Vercel URL → Redeploy

---

## ✅ Done!

Your app is live at your Vercel URL! 🎉

**For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

