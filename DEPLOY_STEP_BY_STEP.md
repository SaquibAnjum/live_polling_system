# Step-by-Step Deployment Guide
## Complete Walkthrough from Scratch

Follow these steps **in order**. Check off each step as you complete it.

---

## 📋 PREPARATION (5 minutes)

### Step 1: Verify Your Code is Ready
- [ ] All code is committed to Git
- [ ] Code is pushed to GitHub
- [ ] You have MongoDB Atlas connection string ready
- [ ] You have GitHub account ready

---

## 🗄️ PART A: MongoDB Atlas Setup (10 minutes)

### Step A1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google
4. Verify email if required

### Step A2: Create Cluster
1. Click "Build a Database"
2. Select "M0 Free"
3. Choose provider: AWS
4. Choose region: Closest to you
5. Click "Create"
6. **Wait 2-3 minutes**

### Step A3: Create Database User
1. Left sidebar → "Database Access"
2. Click "Add New Database User"
3. Authentication: Password
4. Username: `intervue-admin`
5. Password: Generate secure password (SAVE IT!)
6. Privileges: Atlas admin
7. Click "Add User"

### Step A4: Network Access
1. Left sidebar → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step A5: Get Connection String
1. "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<username>` with your username
5. Replace `<password>` with your password
6. Replace `<dbname>` with `intervue-polling`
7. **Save this string** - You'll need it!

**Example Result:**
```
mongodb+srv://intervue-admin:MyPassword123@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority
```

- [ ] MongoDB Atlas setup complete
- [ ] Connection string saved

---

## 📦 PART B: Push to GitHub (5 minutes)

### Step B1: Create GitHub Repository
1. Go to: https://github.com
2. Click "+" → "New repository"
3. Name: `intervue-polling-system`
4. Description: "Live Polling System"
5. Visibility: **Public**
6. **DO NOT** check any boxes
7. Click "Create repository"

### Step B2: Push Your Code
Open terminal in your project folder:

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/intervue-polling-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

- [ ] GitHub repository created
- [ ] Code pushed to GitHub

---

## 🚀 PART C: Deploy Backend to Render (15 minutes)

### Step C1: Create Render Account
1. Go to: https://render.com
2. Click "Get Started for Free"
3. Click "Sign up with GitHub"
4. Authorize Render
5. Verify email if required

### Step C2: Create Web Service
1. Dashboard → Click "New +" (top right)
2. Select "Web Service"
3. If prompted: "Connect account" → Select GitHub
4. Find your repository: `intervue-polling-system`
5. Click "Connect"

### Step C3: Configure Service

**Fill in these fields:**

- **Name**: `intervue-backend`
- **Region**: Choose closest (e.g., Oregon)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **CRITICAL**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free**

### Step C4: Add Environment Variables

Click "Advanced" → Scroll to "Environment Variables"

**Add these 6 variables:**

1. **PORT**
   - Value: `5000`

2. **MONGODB_URI**
   - Value: Your MongoDB connection string from Step A5
   - Example: `mongodb+srv://intervue-admin:password@cluster0.xxxxx.mongodb.net/intervue-polling?retryWrites=true&w=majority`

3. **JWT_SECRET**
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or use: `your-super-secret-jwt-key-minimum-32-characters-long-for-production`
   - Value: (paste generated secret)

4. **TEACHER_PASSWORD**
   - Value: `teacher123` (or your choice)

5. **CORS_ORIGIN**
   - Value: `https://placeholder.vercel.app` (we'll update this later)

6. **NODE_ENV**
   - Value: `production`

### Step C5: Deploy
1. Scroll down
2. Click "Create Web Service"
3. **Wait 5-10 minutes** for first deployment
4. Watch build logs
5. When you see "Your service is live", copy the URL
   - Example: `https://intervue-backend.onrender.com`

### Step C6: Test Backend
1. Open new tab
2. Visit: `https://your-backend-url.onrender.com/health`
3. Should see: `{"status":"ok","timestamp":"..."}`
4. If yes, backend is working! ✅

- [ ] Render account created
- [ ] Web service created
- [ ] Environment variables added
- [ ] Backend deployed
- [ ] Health check works
- [ ] Backend URL saved: `https://________________.onrender.com`

---

## 🌐 PART D: Deploy Frontend to Vercel (10 minutes)

### Step D1: Create Vercel Account
1. Go to: https://vercel.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Vercel
5. Complete setup

### Step D2: Import Project
1. Dashboard → Click "Add New..." → "Project"
2. Find repository: `intervue-polling-system`
3. Click "Import"

### Step D3: Configure Project

**Important Settings:**

1. **Root Directory**: 
   - Click "Edit" next to Root Directory
   - Change from `/` to `frontend`
   - Click "Continue"

2. **Framework Preset**: 
   - Should auto-detect "Vite"
   - If not, select "Vite" manually

3. **Build Settings** (should auto-detect):
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step D4: Add Environment Variables

Before deploying, click "Environment Variables" and add:

**Variable 1:**
- Key: `VITE_API_URL`
- Value: `https://your-backend-url.onrender.com`
- ⚠️ Replace with your actual Render backend URL from Step C5

**Variable 2:**
- Key: `VITE_SOCKET_URL`
- Value: `https://your-backend-url.onrender.com`
- ⚠️ Same as above

**Example:**
```
VITE_API_URL=https://intervue-backend.onrender.com
VITE_SOCKET_URL=https://intervue-backend.onrender.com
```

### Step D5: Deploy
1. Click "Deploy"
2. **Wait 2-3 minutes**
3. Watch build progress
4. When "Ready", copy your frontend URL
   - Example: `https://intervue-polling-system.vercel.app`

### Step D6: Test Frontend
1. Open new tab
2. Visit your Vercel URL
3. Should see Welcome page with purple gradient
4. If yes, frontend is working! ✅

- [ ] Vercel account created
- [ ] Project imported
- [ ] Root directory set to `frontend`
- [ ] Environment variables added
- [ ] Frontend deployed
- [ ] Welcome page loads
- [ ] Frontend URL saved: `https://________________.vercel.app`

---

## 🔄 PART E: Update Backend CORS (2 minutes)

### Step E1: Update CORS_ORIGIN
1. Go back to Render dashboard
2. Open your backend service
3. Click "Environment" tab
4. Find `CORS_ORIGIN` variable
5. Click "Edit" (pencil icon)
6. Change value to your Vercel frontend URL
   - Example: `https://intervue-polling-system.vercel.app`
7. Click "Save Changes"
8. Render will auto-redeploy (wait 2-3 minutes)

### Step E2: Verify Redeployment
1. Wait for "Your service is live" message
2. Check that status is "Live"

- [ ] CORS_ORIGIN updated to Vercel URL
- [ ] Backend redeployed
- [ ] Status shows "Live"

---

## ✅ PART F: Final Testing (10 minutes)

### Step F1: Test Teacher Flow
1. Visit your Vercel frontend URL
2. Click "I'm a Teacher"
3. Login with password from Render env vars
4. Click "Create New Poll"
5. Copy the poll link
6. Enter a question: "What is 2+2?"
7. Add options: "4", "5", "6"
8. Set time: 60 seconds
9. Click "Ask Question"
10. Verify question appears

- [ ] Teacher can login
- [ ] Teacher can create poll
- [ ] Teacher can start question

### Step F2: Test Student Flow
1. Open poll link in new tab/incognito window
2. Enter name: "Test Student"
3. Click "Continue"
4. Wait for question to appear
5. Select an answer option
6. Click "Submit Answer"
7. Verify results appear

- [ ] Student can join
- [ ] Student can see question
- [ ] Student can submit answer
- [ ] Results appear

### Step F3: Test Real-time Updates
1. Keep both tabs open (teacher and student)
2. In student tab, submit answer
3. In teacher tab, verify results update immediately
4. Check browser console (F12) for errors
5. Verify Socket.IO connection (no errors)

- [ ] Results update in real-time
- [ ] No console errors
- [ ] Socket.IO connected

### Step F4: Test Chat
1. In teacher tab, click chat button (bottom-right)
2. Type message: "Hello students!"
3. Click "Send"
4. In student tab, click chat button
5. Verify teacher's message appears
6. Type reply: "Hi teacher!"
7. Click "Send"
8. In teacher tab, verify student's message appears

- [ ] Chat button works
- [ ] Messages send and receive
- [ ] Real-time chat working

### Step F5: Test Poll History
1. In teacher tab, click "View Poll history" (top right)
2. Verify past questions and results display
3. Check that percentages and counts are shown

- [ ] Poll history page loads
- [ ] Past results display correctly

---

## 🎯 PART G: Final Verification

### Your Deployment URLs

**Backend:**
```
https://________________.onrender.com
```

**Frontend:**
```
https://________________.vercel.app
```

### Quick Health Checks

1. **Backend Health**: 
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok"}`

2. **Frontend**: 
   - Visit: `https://your-frontend.vercel.app`
   - Should show Welcome page

3. **Socket.IO**: 
   - Open browser console (F12)
   - Should see Socket.IO connection (no errors)

- [ ] Backend URL working
- [ ] Frontend URL working
- [ ] Socket.IO connected
- [ ] All features tested
- [ ] No errors in console

---

## 📧 Ready for Submission!

### Email Template

**To:** pallavi@intervue.info  
**Subject:** SDE INTERN ASSIGNMENT SUBMISSION

**Body:**
```
Name: [Your Full Name]
Phone Number: [Your Contact Number]
Email ID: [Your Email Address]
LinkedIn URL: [Your LinkedIn Profile Link]

Assignment Link: https://your-frontend.vercel.app

Backend URL: https://your-backend.onrender.com
Frontend URL: https://your-frontend.vercel.app
GitHub Repository: https://github.com/your-username/intervue-polling-system

[Attach your CV]
```

---

## 🆘 Common Issues & Solutions

### Issue: Backend build fails
**Solution:**
- Check Root Directory is set to `backend`
- Verify package.json exists in backend folder
- Check build logs for specific errors

### Issue: Frontend can't connect to backend
**Solution:**
- Verify VITE_API_URL matches backend URL exactly
- Check CORS_ORIGIN in backend matches frontend URL
- Ensure backend is "Live" in Render

### Issue: MongoDB connection fails
**Solution:**
- Verify Network Access includes 0.0.0.0/0
- Check connection string format
- Verify username/password are correct

### Issue: Socket.IO not working
**Solution:**
- Check browser console for errors
- Verify VITE_SOCKET_URL is correct
- Ensure CORS_ORIGIN is updated
- Check Render logs for WebSocket errors

---

## ✅ Completion Checklist

- [ ] MongoDB Atlas configured
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] CORS updated
- [ ] All features tested
- [ ] URLs saved
- [ ] Ready for submission email

---

**🎉 Congratulations! Your Live Polling System is now deployed!**

For detailed troubleshooting, see `COMPLETE_DEPLOYMENT_GUIDE.md`

