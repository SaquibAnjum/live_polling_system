# Backend - Live Polling System

Backend server for the Intervue Polling System built with Node.js, Express, Socket.IO, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `MONGODB_URI`: MongoDB connection string (or leave empty for in-memory mode)
- `JWT_SECRET`: Secret key for JWT tokens
- `TEACHER_PASSWORD`: Password for teacher login
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Frontend URL

## Run

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### POST /api/auth/teacher/login
Teacher login endpoint.

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

### POST /api/polls
Create a new poll (requires teacher authentication).

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

**Response:**
```json
{
  "pollId": "poll-id",
  "pollData": { ... }
}
```

### GET /api/polls/:pollId
Get poll details and history.

**Response:**
```json
{
  "_id": "poll-id",
  "title": "Poll Title",
  "questions": [ ... ],
  "sessions": [ ... ]
}
```

## Socket.IO Events

### Client -> Server

- `student_join`: { pollId, name, tabId }
- `teacher_join`: { pollId }
- `start_question`: { pollId, question: { text, options, timeLimit } }
- `submit_answer`: { pollId, questionId, optionIndex, studentName, socketId }
- `kick_student`: { pollId, socketId }
- `chat_message`: { pollId, message, sender, role }

### Server -> Client

- `question_started`: { questionId, pollId, questionText, options, timeLimit, startAt }
- `time_left`: { secondsLeft }
- `result_update`: { counts, total, percentages }
- `question_ended`: { finalCounts, finalPercentages, total }
- `participants_update`: { participants }
- `kicked_out`: { message }
- `name_assigned`: { name }
- `error`: { message }

## Docker

Build and run with Docker:
```bash
docker build -t intervue-backend .
docker run -p 5000:5000 --env-file .env intervue-backend
```


