# Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## Pre-Deployment

### Backend Setup
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created
- [ ] Database user created with password
- [ ] Network access configured (IP whitelist)
- [ ] Connection string copied and tested
- [ ] Backend `.env` file created with all variables
- [ ] `JWT_SECRET` generated (32+ characters)
- [ ] `TEACHER_PASSWORD` set to secure value
- [ ] Backend runs locally without errors
- [ ] Socket.IO connection works locally

### Frontend Setup
- [ ] Frontend `.env` file created
- [ ] `VITE_API_URL` points to local backend (for testing)
- [ ] `VITE_SOCKET_URL` points to local backend (for testing)
- [ ] Frontend runs locally without errors
- [ ] Can connect to local backend
- [ ] All UI components render correctly

### Code Preparation
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in code (no hardcoded passwords/secrets)
- [ ] `.env` files in `.gitignore`
- [ ] `node_modules` in `.gitignore`

## Backend Deployment (Render/Railway)

### Render Deployment
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] New Web Service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] `PORT=5000`
  - [ ] `MONGODB_URI` (with actual connection string)
  - [ ] `JWT_SECRET` (secure random string)
  - [ ] `TEACHER_PASSWORD` (secure password)
  - [ ] `CORS_ORIGIN` (will update after frontend deploy)
  - [ ] `NODE_ENV=production`
- [ ] Service deployed successfully
- [ ] Backend URL copied (e.g., `https://xxx.onrender.com`)
- [ ] Health check works: `https://xxx.onrender.com/health`

### Railway Deployment
- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] New project created
- [ ] Root directory set to `backend`
- [ ] Environment variables added (same as Render)
- [ ] Service deployed successfully
- [ ] Backend URL copied
- [ ] Health check works

### Backend Verification
- [ ] Backend logs show no errors
- [ ] MongoDB connection successful (check logs)
- [ ] Socket.IO server started
- [ ] Can access `/health` endpoint
- [ ] CORS configured (may need frontend URL first)

## Frontend Deployment (Vercel/Netlify)

### Vercel Deployment
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] New project imported
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_API_URL` (backend URL from Render/Railway)
  - [ ] `VITE_SOCKET_URL` (backend URL from Render/Railway)
- [ ] Project deployed successfully
- [ ] Frontend URL copied (e.g., `https://xxx.vercel.app`)

### Netlify Deployment
- [ ] Netlify account created
- [ ] GitHub repository connected
- [ ] New site created
- [ ] Base directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/dist`
- [ ] Environment variables added (same as Vercel)
- [ ] Site deployed successfully
- [ ] Frontend URL copied

### Frontend Verification
- [ ] Frontend loads without errors
- [ ] No console errors in browser
- [ ] Can navigate to all pages
- [ ] Environment variables loaded correctly

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Updated `CORS_ORIGIN` in backend environment variables
- [ ] Set to exact frontend URL (e.g., `https://xxx.vercel.app`)
- [ ] Backend redeployed (or auto-redeployed)
- [ ] CORS errors resolved

### MongoDB Atlas Configuration
- [ ] Network Access includes Render/Railway IPs
- [ ] Or set to `0.0.0.0/0` (less secure, easier)
- [ ] Database user has correct permissions
- [ ] Connection string is correct

## End-to-End Testing

### Teacher Flow
- [ ] Can access frontend URL
- [ ] Can select "I'm a Teacher"
- [ ] Can login with teacher password
- [ ] Can create a new poll
- [ ] Poll link is generated correctly
- [ ] Can enter question text
- [ ] Can add multiple options
- [ ] Can set time limit
- [ ] Can start question
- [ ] Can see live results update
- [ ] Can view poll history
- [ ] Can kick students (if implemented)
- [ ] Chat works (if implemented)

### Student Flow
- [ ] Can access poll link
- [ ] Can enter name
- [ ] Can join poll
- [ ] Sees waiting screen when no question
- [ ] Question appears when teacher starts
- [ ] Can select answer option
- [ ] Can submit answer (only once)
- [ ] Sees live results after submission
- [ ] Timer countdown works
- [ ] Question ends after timeout
- [ ] Can see final results
- [ ] Chat works (if implemented)

### Real-time Features
- [ ] Socket.IO connection established (check browser console)
- [ ] Results update in real-time on both sides
- [ ] Timer syncs correctly
- [ ] Multiple students can join
- [ ] Teacher sees participant list update
- [ ] No connection errors in console

### Edge Cases
- [ ] Duplicate student names handled (auto-renamed)
- [ ] Student can only submit once per question
- [ ] Teacher cannot start new question while previous active
- [ ] Teacher can start new question after all students answer
- [ ] Teacher can start new question after timeout
- [ ] Kicked students see kicked message
- [ ] Disconnected students removed from participant list

## Performance & Security

- [ ] Backend responds quickly (< 2s)
- [ ] Frontend loads quickly (< 3s)
- [ ] No sensitive data exposed in frontend code
- [ ] Environment variables not committed to Git
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] MongoDB password is secure
- [ ] Teacher password is secure
- [ ] JWT_SECRET is secure and random

## Documentation

- [ ] README.md updated with deployment URLs
- [ ] Screenshots added to README (optional)
- [ ] Demo GIF/video created (optional)
- [ ] API documentation clear
- [ ] Environment variables documented

## Final Verification

- [ ] All acceptance criteria met
- [ ] Application works end-to-end
- [ ] No critical errors in logs
- [ ] Real-time features working
- [ ] UI matches Figma design
- [ ] Responsive on mobile devices
- [ ] Ready for demo/presentation

---

## Quick Test Commands

### Test Backend Health
```bash
curl https://your-backend-url.onrender.com/health
```

### Test Frontend
Open in browser and check:
- Console for errors (F12)
- Network tab for failed requests
- Socket.IO connection status

---

**Status: [ ] Not Started | [ ] In Progress | [ ] Complete**


