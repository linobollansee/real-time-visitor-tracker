# Real-Time Visitor Tracker

A real-time visitor tracking application built with **Next.js** (frontend) and **Express** (backend) using **Server-Sent Events (SSE)** for live updates.

## Features

✅ **Real-time Connection Tracking**: Displays the number of active connections and unique visitors  
✅ **Server-Sent Events (SSE)**: Persistent connection for instant updates without page refresh  
✅ **Unique Visitor Detection**: Uses cookies to differentiate between multiple tabs from the same user  
✅ **Connection Resilience**: Automatic reconnection if the server restarts  
✅ **Heartbeat Mechanism**: Keep-alive pings every 15 seconds to prevent connection timeout  
✅ **Modern UI**: Beautiful, responsive interface built with Tailwind CSS

## Project Structure

```
real-time-visitor-tracker/
├── backend/
│   ├── server.js           # Express server with SSE endpoint
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Main page component
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── package.json        # Frontend dependencies
│   ├── next.config.js      # Next.js configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── tsconfig.json       # TypeScript configuration
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

You need to run both the backend and frontend servers simultaneously.

### Terminal 1: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3001`

### Terminal 2: Start the Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Open additional tabs or browsers to see the visitor count increase
3. Close tabs to see the count decrease in real-time
4. Try opening multiple tabs in the same browser - the "Unique Visitors" count will remain the same while "Total Connections" increases

## How It Works

### Backend (Express + SSE)

- **SSE Endpoint** (`/events`): Maintains persistent connections with clients
- **Connection Tracking**: Keeps track of active connections using an in-memory Map
- **Cookie-based Sessions**: Assigns a unique `visitorId` cookie to each user
- **Broadcasting**: Sends updates to all connected clients when the count changes
- **Heartbeat**: Sends keep-alive comments every 15 seconds

### Frontend (Next.js + EventSource)

- **EventSource API**: Establishes SSE connection to the backend
- **Real-time Updates**: Listens for messages and updates the UI dynamically
- **Auto-reconnection**: EventSource automatically attempts to reconnect on connection loss
- **Visual Feedback**: Shows connection status and last update time

## Technical Highlights

### Core Requirements ✅

- [x] Single SSE endpoint (`/events`)
- [x] EventSource API for client connection
- [x] Track active connections (increment on connect, decrement on disconnect)
- [x] Broadcast count changes to all connected clients
- [x] Dynamic UI updates without page refresh

### Bonus Features ✅

- [x] **Heartbeat**: Keep-alive comments every 15 seconds
- [x] **Connection Resilience**: Automatic reconnection (built into EventSource)
- [x] **Unique Visitors**: Cookie-based session tracking to count unique users

## API Endpoints

### `GET /events`

Server-Sent Events endpoint for real-time visitor count updates.

**Response Format:**

```
data: {"totalConnections": 5, "uniqueVisitors": 3, "timestamp": "2025-12-17T..."}
```

### `GET /health`

Health check endpoint returning current statistics.

**Response:**

```json
{
  "status": "ok",
  "totalConnections": 5,
  "uniqueVisitors": 3,
  "timestamp": "2025-12-17T..."
}
```

## Technologies Used

### Backend

- **Express.js**: Web server framework
- **CORS**: Cross-origin resource sharing
- **cookie-parser**: Parse cookies for session tracking
- **uuid**: Generate unique session IDs

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **EventSource API**: Native browser SSE client

## License

MIT

## Author

Built as a coding challenge to demonstrate real-time visitor tracking using SSE.
