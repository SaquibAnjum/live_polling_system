# Step-by-Step Setup & Deployment

Follow these steps in order. Each step has a checkbox - check it off as you complete it.

## 📦 STEP 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```
- [ ] Backend dependencies installed

### Frontend
```bash
cd frontend
npm install
```
- [ ] Frontend dependencies installed

---

## ⚙️ STEP 2: Create Environment Files

### Option A: Use Setup Script

**Windows:**
```powershell
.\setup-env.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

### Option B: Manual

**Backend:**
```bash
cd backend
cp .env.example .env
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

- [ ] `backend/.env` created
- [ ] `frontend/.env` created

---

## 🔑 STEP 3: Configure Backend Environment

Edit `backend/.env` file:

```env
PORT=5000
MONGODB_URI=                                    # Step 4 - leave empty for now
JWT_SECRET=                                     # Step 5 - generate this
TEACHER_PASSWORD=teacher123                     # Change this!
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Generate JWT_SECRET:
```bash
cd backend
node generate-secret.js
```
Copy the output and paste into `backend/.env` as `JWT_SECRET=...`

- [ ] `JWT_SECRET` generated and added
- [ ] `TEACHER_PASSWORD` changed (optional but recommended)

---

## 🗄️ STEP 4: MongoDB Atlas Setup (Optional)

**Skip this if you want to use in-memory mode for testing.**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Click "Build a Database"
4. Choose "M0 Free" tier
5. Select region → Click "Create"
6. Wait for cluster to be created (2-3 minutes)

### Create Database User:
1. Go to "Database Access" → "Add New Database User"
2. Username: `intervue-admin`
3. Password: Generate secure password (save it!)
4. Privileges: "Atlas admin"
5. Click "Add User"

### Whitelist IP:
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### Get Connection String:
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your password
5. Replace `<dbname>` with `intervue-polling`

Example:
```
mongodb+srv://intervue-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority
```

Paste this into `backend/.env` as `MONGODB_URI=...`

- [ ] MongoDB Atlas account created
- [ ] Cluster created
- [ ] Database user created
- [ ] IP whitelisted
- [ ] Connection string added to `backend/.env`

---

## 🎨 STEP 5: Configure Frontend Environment

Edit `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

**For local development, these are correct as-is.**

- [ ] `frontend/.env` configured

---

## 🧪 STEP 6: Test Locally

### Start Backend (Terminal 1):
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📡 Socket.IO server ready
```

- [ ] Backend started successfully

### Start Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

- [ ] Frontend started successfully

### Test the App:
1. Open http://localhost:5173
2. Click "I'm a Teacher"
3. Login with password from `.env`
4. Create a poll
5. Copy poll link
6. Open in new tab/incognito
7. Join as student
8. Test answering questions

- [ ] App works locally
- [ ] Teacher can create poll
- [ ] Student can join and answer
- [ ] Real-time updates work

---

## ☁️ STEP 7: Deploy Backend to Render

### 7.1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended)

- [ ] Render account created

### 7.2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select your repository

- [ ] Repository connected

### 7.3: Configure Service
- **Name**: `intervue-backend` (or your choice)
- **Region**: Choose closest
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

- [ ] Service configured

### 7.4: Add Environment Variables
Click "Environment" tab, add:

```
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-from-step-3
TEACHER_PASSWORD=your-teacher-password
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Note:** For `CORS_ORIGIN`, use a placeholder for now (e.g., `https://placeholder.vercel.app`). You'll update it after deploying frontend.

- [ ] Environment variables added

### 7.5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your service URL (e.g., `https://intervue-backend.onrender.com`)

- [ ] Backend deployed
- [ ] Backend URL copied: `https://________________.onrender.com`

### 7.6: Test Backend
Visit: `https://your-backend-url.onrender.com/health`

Should return: `{"status":"ok","timestamp":"..."}`

- [ ] Backend health check works

---

## 🌐 STEP 8: Deploy Frontend to Vercel

### 8.1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

- [ ] Vercel account created

### 8.2: Import Project
1. Click "Add New..." → "Project"
2. Import GitHub repository
3. Select your repository

- [ ] Repository imported

### 8.3: Configure Project
- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)

- [ ] Project configured

### 8.4: Add Environment Variables
Click "Environment Variables", add:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

**Replace `your-backend-url.onrender.com` with your actual Render URL from Step 7.**

- [ ] Environment variables added

### 8.5: Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL (e.g., `https://intervue-polling.vercel.app`)

- [ ] Frontend deployed
- [ ] Frontend URL copied: `https://________________.vercel.app`

---

## 🔄 STEP 9: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Find `CORS_ORIGIN` variable
5. Update value to your Vercel URL (from Step 8)
6. Save changes
7. Render will auto-redeploy

- [ ] `CORS_ORIGIN` updated to frontend URL
- [ ] Backend redeployed

---

## ✅ STEP 10: Final Testing

### Test Frontend:
1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for errors

- [ ] Frontend loads without errors
- [ ] No console errors

### Test Teacher Flow:
1. Click "I'm a Teacher"
2. Login
3. Create poll
4. Start question

- [ ] Teacher login works
- [ ] Can create poll
- [ ] Can start question

### Test Student Flow:
1. Copy poll link
2. Open in new tab/incognito
3. Enter name
4. Join poll
5. Answer question

- [ ] Student can join
- [ ] Can answer question
- [ ] Results update in real-time

### Test Socket.IO:
1. Open browser console
2. Look for WebSocket connection
3. Should see Socket.IO connected

- [ ] Socket.IO connection established
- [ ] No connection errors

---

## 🎉 STEP 11: You're Done!

Your Live Polling System is now deployed and working!

**Frontend URL:** https://________________.vercel.app
**Backend URL:** https://________________.onrender.com

### Next Steps:
- [ ] Add screenshots to README
- [ ] Test with multiple students
- [ ] Verify all features work
- [ ] Share with your team!

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs for errors

**Frontend won't connect:**
- Verify `VITE_API_URL` matches backend URL
- Check browser console for CORS errors
- Ensure backend CORS_ORIGIN is set correctly

**Socket.IO not working:**
- Check that both URLs use HTTPS
- Verify CORS_ORIGIN matches frontend URL exactly
- Check browser console for WebSocket errors

**Need more help?**
- See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for common issues

