# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Local Development (Recommended for Testing)

1. **Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env - at minimum set TEACHER_PASSWORD
npm run dev
```

2. **Frontend** (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

3. **Access**
- Open http://localhost:5173
- Click "I'm a Teacher"
- Login with password from `.env` (default: `teacher123`)
- Create a poll
- Share the link with students

### Option 2: Docker (All-in-One)

```bash
# Make sure you have docker-compose installed
docker-compose up --build

# Access at http://localhost:5173
```

## 📋 Default Credentials

- **Teacher Password**: `teacher123` (change in `.env`)

## 🧪 Quick Test Flow

1. **Teacher Side:**
   - Go to http://localhost:5173
   - Select "I'm a Teacher"
   - Login with password
   - Click "Create New Poll"
   - Copy the poll link
   - Enter a question: "Which planet is known as the Red Planet?"
   - Add options: "Mars", "Venus", "Jupiter", "Saturn"
   - Set time limit: 60 seconds
   - Click "Ask Question"

2. **Student Side:**
   - Open the poll link in a new tab/incognito window
   - Enter your name
   - Wait for question to appear
   - Select an answer
   - Click "Submit"
   - See live results

3. **Verify:**
   - Results update in real-time on both sides
   - Timer counts down
   - After 60s, question ends automatically
   - Teacher can start new question after all students answer or timeout

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 5000 is available
- Verify MongoDB connection (or it will use in-memory mode)

**Frontend won't connect:**
- Check `VITE_API_URL` in `.env` matches backend URL
- Check browser console for errors

**Socket.IO not working:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check network tab for WebSocket connection

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [backend/README.md](./backend/README.md) for API docs
- Check [frontend/README.md](./frontend/README.md) for frontend details


