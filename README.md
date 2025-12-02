# Intervue Poll - Live Polling System

A production-ready, end-to-end Live Polling System built for Intervue.io SDE Intern assignment. This system enables real-time interaction between teachers and students through live polls with Socket.IO-based real-time updates.

## 🎯 Features

### Teacher Features
- ✅ Create new polls
- ✅ Start questions with multiple options and configurable time limits (30s, 60s, 90s, 120s)
- ✅ View live results with real-time vote counts and percentages
- ✅ Kick students from the session
- ✅ View poll history
- ✅ Chat with students
- ✅ Enforce rules: Can only start new question if previous one ended or all students answered

### Student Features
- ✅ Join polls with unique names (auto-handles duplicates)
- ✅ Submit answers (one answer per question enforced)
- ✅ View live results after submission or timeout
- ✅ See countdown timer
- ✅ Chat with teacher and other students
- ✅ Wait screen when no question is active

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite, Redux Toolkit, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js + Express, Socket.IO, MongoDB (with in-memory fallback)
- **Real-time**: Socket.IO v4
- **Database**: MongoDB Atlas (or in-memory for demo)
- **Deployment**: Docker support for both frontend and backend

## 📁 Project Structure

```
intervue.io/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server setup
│   │   ├── models/
│   │   │   └── Poll.js           # MongoDB schema
│   │   ├── routes/
│   │   │   ├── auth.js           # Teacher authentication
│   │   │   └── polls.js          # Poll CRUD endpoints
│   │   └── socketHandlers/
│   │       └── socketHandler.js  # Socket.IO event handlers
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/                # React page components
│   │   ├── components/           # Reusable components
│   │   ├── store/                # Redux store and slices
│   │   └── services/             # API and Socket clients
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml            # Local development setup
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or use in-memory mode for testing)
- Docker (optional, for containerized deployment)

### Local Development

**Option 1: Automated Setup (Recommended)**

**Windows:**
```powershell
.\setup-env.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-env.sh && ./setup-env.sh
```

**Option 2: Manual Setup**

1. **Clone the repository**
```bash
git clone <repository-url>
cd intervue.io
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other configs
npm run dev
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Docker Setup

```bash
# Build and run all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 📚 Detailed Guides

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Fastest path to deployment
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete step-by-step setup instructions
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## 📡 API Documentation

### HTTP Endpoints

#### POST /api/auth/teacher/login
Teacher authentication.

**Request:**
```json
{
  "password": "teacher123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here"
}
```

#### POST /api/polls
Create a new poll (requires teacher token).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Poll Title",
  "options": ["Option 1", "Option 2"],
  "timeLimit": 60
}
```

#### GET /api/polls/:pollId
Get poll details and history.

### Socket.IO Events

#### Client → Server

- `student_join`: { pollId, name, tabId }
- `teacher_join`: { pollId }
- `start_question`: { pollId, question: { text, options, timeLimit } }
- `submit_answer`: { pollId, questionId, optionIndex, studentName, socketId }
- `kick_student`: { pollId, socketId }
- `chat_message`: { pollId, message, sender, role }

#### Server → Client

- `question_started`: { questionId, pollId, questionText, options, timeLimit, startAt }
- `time_left`: { secondsLeft }
- `result_update`: { counts, total, percentages }
- `question_ended`: { finalCounts, finalPercentages, total }
- `participants_update`: { participants }
- `kicked_out`: { message }
- `name_assigned`: { name }
- `error`: { message }

## 🎨 UI Design

The UI follows the provided Figma design with:
- Purple gradient theme (#7765DA, #5767D0, #4F0DCE)
- Clean white content areas on dark gray background (#373737)
- Responsive design with Tailwind CSS
- Smooth animations and transitions

### Color Palette
- Primary Light: `#7765DA`
- Primary: `#5767D0`
- Primary Dark: `#4F0DCE`
- Gray Light: `#F2F2F2`
- Gray: `#6E6E6E`
- Gray Dark: `#373737`

## 🔒 Business Rules & Constraints

1. **Teacher can start new question only if:**
   - No question has been asked yet, OR
   - All currently connected students have submitted an answer, OR
   - Previous question timed out (server emitted `question_ended`)

2. **Student can submit only once per question** (enforced server-side)

3. **Server-side authoritative timer**: Timer countdown is managed by the server, ensuring fairness

4. **Unique student names**: If duplicate name detected, server appends suffix (e.g., "Alex (2)")

5. **One answer per student per question**: Server tracks submissions by socketId

## 🧪 Testing

### Manual Testing Checklist

- [ ] Teacher can create a poll
- [ ] Teacher can start a question with multiple options
- [ ] Student can join with a name
- [ ] Student can submit exactly one answer
- [ ] Results update live on both teacher and student sides
- [ ] Timer expires and server ends question automatically
- [ ] Teacher cannot start new question while previous is active
- [ ] Teacher can kick students
- [ ] Chat functionality works
- [ ] Poll history displays correctly

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Create account** on Render/Railway/Heroku

2. **Create new service** and connect your GitHub repository

3. **Set environment variables:**
   - `PORT`: 5000 (or auto-assigned)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `TEACHER_PASSWORD`: Teacher login password
   - `CORS_ORIGIN`: Your frontend URL (e.g., https://your-app.vercel.app)
   - `NODE_ENV`: production

4. **Build command:** `npm install`
5. **Start command:** `npm start`

6. **Important for Socket.IO**: Ensure your hosting provider supports WebSocket connections (Render and Railway do by default)

### Frontend Deployment (Vercel/Netlify)

1. **Create account** on Vercel or Netlify

2. **Import your GitHub repository**

3. **Set environment variables:**
   - `VITE_API_URL`: Your backend URL (e.g., https://your-backend.onrender.com)
   - `VITE_SOCKET_URL`: Your backend URL (same as above)

4. **Build settings:**
   - Build command: `npm run build`
   - Output directory: `dist`

5. **Deploy**

### Docker Deployment

Both frontend and backend include Dockerfiles. You can deploy to any container hosting service:

```bash
# Backend
cd backend
docker build -t intervue-backend .
docker run -p 5000:5000 --env-file .env intervue-backend

# Frontend
cd frontend
docker build -t intervue-frontend .
docker run -p 5173:5173 --env-file .env intervue-frontend
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervue-polling
JWT_SECRET=your-secret-key-change-in-production
TEACHER_PASSWORD=teacher123
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Socket.IO Connection Issues
- Ensure CORS_ORIGIN matches your frontend URL
- Check that WebSocket support is enabled on your hosting provider
- Verify firewall settings allow WebSocket connections

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes your server IP (or 0.0.0.0/0 for development)
- Check connection string format
- System will fall back to in-memory mode if MongoDB is unavailable

### Frontend Build Issues
- Ensure all environment variables are set
- Check that VITE_ prefix is used for Vite environment variables

## 📄 License

This project is created for Intervue.io SDE Intern assignment.

## 👤 Developer

[Add your name and CV link here]

## 🎬 Demo

[Add screenshots or GIF demonstrating the flow: Teacher creates poll → Student joins → Question asked → Student answers → Live results]

### Screenshots
1. Welcome screen with role selection
2. Teacher dashboard with question creation
3. Student poll interface with timer
4. Live results display
5. Poll history view

---

**Note**: This is a production-ready implementation following all specified requirements and acceptance criteria. The system is designed to be scalable, maintainable, and follows best practices for real-time applications.
