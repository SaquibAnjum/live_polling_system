# Complete End-to-End Deployment Guide
## Backend on Render + Frontend on Vercel

This guide will walk you through deploying both services from scratch, step by step.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account (free)
- [ ] Render account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Your code pushed to a GitHub repository

---

## 🗄️ STEP 1: Set Up MongoDB Atlas (If Not Done)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Sign up with your email or Google account

### 1.2 Create a Cluster
1. After login, click "Build a Database"
2. Choose "M0 Free" (Free tier)
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to you (e.g., `N. Virginia (us-east-1)`)
5. Click "Create"

**Wait 2-3 minutes for cluster creation**

### 1.3 Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `intervue-admin` (or your choice)
5. Password: Click "Autogenerate Secure Password" or create your own
   - **IMPORTANT**: Save this password! You'll need it.
6. Database User Privileges: Select "Atlas admin"
7. Click "Add User"

### 1.4 Whitelist IP Addresses
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. For production: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render to connect
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `intervue-polling` (or your choice)
8. **Save this connection string** - You'll need it for Render

**Example:**
```
mongodb+srv://intervue-admin:YourPassword123@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority
```

---

## 📦 STEP 2: Push Code to GitHub

### 2.1 Initialize Git Repository (If Not Done)
```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - Live Polling System"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com
2. Click "+" → "New repository"
3. Repository name: `intervue-polling-system` (or your choice)
4. Description: "Live Polling System for Intervue.io Assignment"
5. Visibility: **Public** (required for free Render/Vercel)
6. **DO NOT** initialize with README, .gitignore, or license
7. Click "Create repository"

### 2.3 Push Code to GitHub
```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/intervue-polling-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username**

---

## 🚀 STEP 3: Deploy Backend to Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### 3.2 Create New Web Service
1. In Render dashboard, click "New +" (top right)
2. Select "Web Service"
3. Click "Connect account" if prompted
4. Select your GitHub repository: `intervue-polling-system`
5. Click "Connect"

### 3.3 Configure Backend Service

**Basic Settings:**
- **Name**: `intervue-polling-backend` (or your choice)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free** (for testing)

### 3.4 Set Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

**Variable 1:**
- Key: `PORT`
- Value: `5000`

**Variable 2:**
- Key: `MONGODB_URI`
- Value: `mongodb+srv://intervue-admin:YourPassword@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority`
- ⚠️ Replace with your actual MongoDB connection string

**Variable 3:**
- Key: `JWT_SECRET`
- Value: Generate a secure random string (32+ characters)
  - You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Or use: `your-super-secret-jwt-key-change-in-production-min-32-characters-long`

**Variable 4:**
- Key: `TEACHER_PASSWORD`
- Value: `teacher123` (or your secure password)

**Variable 5:**
- Key: `CORS_ORIGIN`
- Value: `https://your-frontend-app.vercel.app`
- ⚠️ **We'll update this after deploying frontend** - For now, use: `https://placeholder.vercel.app`

**Variable 6:**
- Key: `NODE_ENV`
- Value: `production`

### 3.5 Deploy Backend
1. Scroll down and click "Create Web Service"
2. Render will start building and deploying (5-10 minutes)
3. Watch the build logs
4. Wait for "Your service is live" message
5. Copy your service URL (e.g., `https://intervue-polling-backend.onrender.com`)

**⚠️ Important Notes:**
- First deployment takes longer (5-10 minutes)
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)

### 3.6 Test Backend
1. Visit: `https://your-backend-url.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`
3. If you see this, backend is working! ✅

---

## 🌐 STEP 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your GitHub

### 4.2 Import Project
1. In Vercel dashboard, click "Add New..." → "Project"
2. Find your repository: `intervue-polling-system`
3. Click "Import"

### 4.3 Configure Frontend Project

**Framework Preset:**
- Vercel should auto-detect "Vite"
- If not, select "Vite" manually

**Root Directory:**
- Click "Edit" next to Root Directory
- Change from `/` to `frontend`
- Click "Continue"

**Build Settings:**
- **Framework Preset**: Vite (auto-detected)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4.4 Set Environment Variables

Click "Environment Variables" and add:

**Variable 1:**
- Key: `VITE_API_URL`
- Value: `https://your-backend-url.onrender.com`
- ⚠️ Replace with your actual Render backend URL

**Variable 2:**
- Key: `VITE_SOCKET_URL`
- Value: `https://your-backend-url.onrender.com`
- ⚠️ Same as above - your Render backend URL

**Example:**
```
VITE_API_URL=https://intervue-polling-backend.onrender.com
VITE_SOCKET_URL=https://intervue-polling-backend.onrender.com
```

### 4.5 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Vercel will show "Building..." then "Ready"
4. Copy your frontend URL (e.g., `https://intervue-polling-system.vercel.app`)

### 4.6 Test Frontend
1. Visit your Vercel URL
2. Should see the Welcome page
3. Try clicking "I'm a Teacher" or "I'm a Student"
4. If pages load, frontend is working! ✅

---

## 🔄 STEP 5: Update Backend CORS

### 5.1 Update CORS_ORIGIN in Render
1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Find `CORS_ORIGIN` variable
5. Click "Edit"
6. Update value to your Vercel URL (e.g., `https://intervue-polling-system.vercel.app`)
7. Click "Save Changes"
8. Render will automatically redeploy (2-3 minutes)

**⚠️ Important:** Wait for redeployment to complete before testing.

---

## ✅ STEP 6: Final Testing

### 6.1 Test Complete Flow

**Teacher Side:**
1. Visit your Vercel frontend URL
2. Click "I'm a Teacher"
3. Login with password from Render env vars
4. Create a new poll
5. Copy the poll link
6. Start a question
7. Check if results appear

**Student Side:**
1. Open poll link in new tab/incognito
2. Enter your name
3. Join the poll
4. Answer the question
5. Check if results update in real-time

### 6.2 Verify Socket.IO Connection
1. Open browser console (F12)
2. Check for WebSocket connection
3. Should see Socket.IO connected
4. No CORS errors

### 6.3 Test Chat
1. Click chat button (bottom-right)
2. Send a message from teacher
3. Send a message from student
4. Verify messages appear on both sides

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Build fails**
- Check build logs in Render
- Verify `package.json` has correct scripts
- Ensure `backend` folder structure is correct

**Problem: MongoDB connection fails**
- Verify MongoDB Atlas Network Access includes Render IPs (0.0.0.0/0)
- Check connection string format
- Verify username/password are correct
- Check MongoDB Atlas logs

**Problem: CORS errors**
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Include `https://` in URL
- No trailing slash
- Wait for redeployment after changes

**Problem: Service won't start**
- Check environment variables are set
- Verify `PORT` is set
- Check Render logs for errors

### Frontend Issues

**Problem: Can't connect to backend**
- Verify `VITE_API_URL` and `VITE_SOCKET_URL` are correct
- Check backend is running (visit /health endpoint)
- Verify CORS is configured correctly

**Problem: Socket.IO not connecting**
- Check browser console for errors
- Verify `VITE_SOCKET_URL` is correct
- Ensure backend supports WebSockets (Render does by default)
- Check CORS_ORIGIN in backend

**Problem: Build fails**
- Check build logs in Vercel
- Verify `frontend` folder structure
- Check for TypeScript/ESLint errors

---

## 📝 Final Checklist

Before submission, verify:

- [ ] Backend deployed on Render and accessible
- [ ] Frontend deployed on Vercel and accessible
- [ ] Backend health check works: `/health` endpoint
- [ ] MongoDB Atlas connected
- [ ] Teacher can login
- [ ] Teacher can create poll
- [ ] Student can join poll
- [ ] Real-time updates work
- [ ] Socket.IO connection established
- [ ] Chat functionality works
- [ ] Poll history displays
- [ ] No console errors
- [ ] CORS configured correctly

---

## 🎯 Your Deployment URLs

After completing all steps, you should have:

**Backend URL:**
```
https://your-backend-name.onrender.com
```

**Frontend URL:**
```
https://your-frontend-name.vercel.app
```

**MongoDB Connection:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intervue-polling
```

---

## 📧 Ready for Submission

Once everything is tested and working:

1. **Backend URL**: `https://your-backend.onrender.com`
2. **Frontend URL**: `https://your-frontend.vercel.app`
3. **GitHub Repo**: `https://github.com/your-username/intervue-polling-system`

Include these in your submission email to: **pallavi@intervue.info**

---

**Need Help?** Check the logs in Render and Vercel dashboards for detailed error messages.

