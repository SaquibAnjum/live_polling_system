# Complete Setup & Deployment Guide

This guide will walk you through setting up and deploying the Live Polling System step by step.

## 📋 Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Running the Application Locally](#running-the-application-locally)
5. [Deploying Backend to Render/Railway](#deploying-backend-to-renderrailway)
6. [Deploying Frontend to Vercel/Netlify](#deploying-frontend-to-vercelnetlify)
7. [Testing the Deployment](#testing-the-deployment)

---

## 🏠 Local Development Setup

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## 🗄️ MongoDB Atlas Setup

### Option A: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account (M0 Free Tier available)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `intervue-admin` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your Render/Railway server IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `intervue-polling` (or your choice)

### Option B: In-Memory Mode (For Testing Only)

If you don't want to set up MongoDB Atlas right now, the application will automatically use in-memory mode when MongoDB connection fails. Just leave `MONGODB_URI` empty or don't set it.

**Note:** In-memory mode means data is lost when the server restarts.

---

## ⚙️ Environment Variables Configuration

### Backend Environment Variables

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Create .env file:**
```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

3. **Edit .env file** with your favorite text editor:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
TEACHER_PASSWORD=teacher123
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Important Notes:**
- Replace `MONGODB_URI` with your MongoDB Atlas connection string (or leave empty for in-memory mode)
- `JWT_SECRET`: Use a long random string (at least 32 characters). You can generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `TEACHER_PASSWORD`: Change this to a secure password
- `CORS_ORIGIN`: Keep as `http://localhost:5173` for local development

### Frontend Environment Variables

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Create .env file:**
```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

3. **Edit .env file:**

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

**For local development, these are correct as-is.**

---

## 🚀 Running the Application Locally

### Step 1: Start Backend Server

Open Terminal 1:
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

If MongoDB connection fails, you'll see:
```
⚠️  Running in in-memory mode (no persistence)
```

### Step 2: Start Frontend Server

Open Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Test the Application

1. Open browser: http://localhost:5173
2. Click "I'm a Teacher"
3. Login with password from `.env` (default: `teacher123`)
4. Create a poll
5. Copy the poll link
6. Open in new tab/incognito window
7. Join as student and test!

---

## ☁️ Deploying Backend to Render/Railway

### Option A: Render (Recommended)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email

#### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository

#### Step 3: Configure Service
- **Name**: `intervue-polling-backend` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main` (or your branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free tier is fine for testing

#### Step 4: Set Environment Variables
Click "Environment" tab and add:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars
TEACHER_PASSWORD=your-secure-password
CORS_ORIGIN=https://your-frontend-app.vercel.app
NODE_ENV=production
```

**Important:**
- Use your actual MongoDB Atlas connection string
- Generate a secure `JWT_SECRET`
- Set `CORS_ORIGIN` to your frontend URL (you'll update this after deploying frontend)
- For now, you can set it to `*` temporarily, then update after frontend deployment

#### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Copy your service URL (e.g., `https://intervue-backend.onrender.com`)

#### Step 6: Update MongoDB Network Access
1. Go to MongoDB Atlas → Network Access
2. Add Render's IP ranges or use `0.0.0.0/0` (less secure but easier)

### Option B: Railway

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

#### Step 3: Configure Service
1. Railway auto-detects Node.js
2. Set **Root Directory** to `backend`
3. Railway will auto-detect `package.json`

#### Step 4: Set Environment Variables
Click "Variables" tab and add:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars
TEACHER_PASSWORD=your-secure-password
CORS_ORIGIN=https://your-frontend-app.vercel.app
NODE_ENV=production
```

#### Step 5: Deploy
1. Railway auto-deploys on push to main branch
2. Wait for deployment
3. Copy your service URL from the "Settings" → "Domains" section

---

## 🌐 Deploying Frontend to Vercel/Netlify

### Option A: Vercel (Recommended)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

#### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Select the repository

#### Step 3: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

#### Step 4: Set Environment Variables
Click "Environment Variables" and add:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

**Important:** Replace `your-backend-url.onrender.com` with your actual backend URL from Render/Railway.

#### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Copy your frontend URL (e.g., `https://intervue-polling.vercel.app`)

#### Step 6: Update Backend CORS
1. Go back to Render/Railway
2. Update `CORS_ORIGIN` environment variable to your Vercel URL
3. Redeploy backend (or it will auto-redeploy)

### Option B: Netlify

#### Step 1: Create Netlify Account
1. Go to https://netlify.com
2. Sign up with GitHub

#### Step 2: Import Project
1. Click "Add new site" → "Import an existing project"
2. Connect to GitHub and select repository

#### Step 3: Configure Build Settings
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

#### Step 4: Set Environment Variables
Click "Site settings" → "Environment variables" and add:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

#### Step 5: Deploy
1. Click "Deploy site"
2. Wait for deployment
3. Copy your site URL

#### Step 6: Update Backend CORS
Update `CORS_ORIGIN` in your backend environment variables to your Netlify URL.

---

## ✅ Testing the Deployment

### Step 1: Test Backend
1. Visit: `https://your-backend-url.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### Step 2: Test Frontend
1. Visit your frontend URL
2. Try to login as teacher
3. Create a poll
4. Test student flow

### Step 3: Test Socket.IO Connection
1. Open browser console (F12)
2. Check for WebSocket connection errors
3. If you see CORS errors, verify `CORS_ORIGIN` in backend matches frontend URL exactly

### Common Issues & Solutions

**Issue: CORS Error**
- **Solution**: Ensure `CORS_ORIGIN` in backend exactly matches frontend URL (including https://)

**Issue: Socket.IO Connection Failed**
- **Solution**: 
  - Verify backend URL is correct in frontend `.env`
  - Check that Render/Railway supports WebSockets (they do by default)
  - Check browser console for specific error

**Issue: MongoDB Connection Failed**
- **Solution**:
  - Verify MongoDB Atlas Network Access includes Render/Railway IPs (or 0.0.0.0/0)
  - Check connection string format
  - Verify database user credentials

**Issue: Frontend Shows "Cannot connect to server"**
- **Solution**:
  - Verify `VITE_API_URL` and `VITE_SOCKET_URL` are set correctly
  - Ensure backend is deployed and running
  - Check backend logs in Render/Railway dashboard

---

## 📝 Final Checklist

Before considering deployment complete:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB Atlas connected (or in-memory mode working)
- [ ] Teacher can login
- [ ] Teacher can create poll
- [ ] Student can join poll
- [ ] Real-time updates working
- [ ] Socket.IO connection established (check browser console)
- [ ] Timer countdown working
- [ ] Results display correctly
- [ ] Chat functionality working (if implemented)

---

## 🔐 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong passwords** for MongoDB and teacher login
3. **Generate secure JWT_SECRET** (32+ characters)
4. **Limit MongoDB Network Access** in production (don't use 0.0.0.0/0)
5. **Use HTTPS** in production (Vercel/Netlify provide this automatically)

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs in Render/Railway dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas network access is configured
5. Check that both services are deployed and running

---

**Congratulations! 🎉 Your Live Polling System is now deployed!**

