# Frontend - Live Polling System

Frontend application for the Intervue Polling System built with React, Vite, Redux, and Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your backend URLs:
- `VITE_API_URL`: Backend API URL (default: http://localhost:3000)
- `VITE_SOCKET_URL`: Socket.IO server URL (default: http://localhost:3000)

## Run

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Features

- **Teacher Dashboard**: Create polls, ask questions, view live results
- **Student Interface**: Join polls, answer questions, see results
- **Real-time Updates**: Live results via Socket.IO
- **Chat System**: Communication between teacher and students
- **Poll History**: View past poll results

## Docker

Build and run with Docker:
```bash
docker build -t intervue-frontend .
docker run -p 5173:5173 --env-file .env intervue-frontend
```

