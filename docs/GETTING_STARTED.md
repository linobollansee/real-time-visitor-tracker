# Getting Started

Welcome to the Real-Time Visitor Tracker project! This guide will help you get up and running quickly.

## Overview

This application tracks active visitors in real-time using Server-Sent Events (SSE). It consists of two main components:

- **Backend**: Express.js server providing SSE endpoints
- **Frontend**: Next.js application with a beautiful UI

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd real-time-visitor-tracker
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Dependencies installed:**

- express: Web server framework
- cors: Enable cross-origin requests
- cookie-parser: Parse HTTP cookies
- uuid: Generate unique session IDs

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Dependencies installed:**

- next: React framework
- react & react-dom: UI library
- tailwindcss: Utility-first CSS framework
- typescript: Type-safe JavaScript

### Running the Application

You need **two terminal windows** to run both servers:

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Expected output:

```
Backend server running on http://localhost:3001
SSE endpoint: http://localhost:3001/events
```

#### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```

Expected output:

```
▲ Next.js 16.0.10 (Turbopack)
- Local:    http://localhost:3000
✓ Ready in 500ms
```

### Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the visitor tracker dashboard with:

- Connection status indicator
- Total connections count
- Unique visitors count
- Last update timestamp

## Testing the Application

### Test 1: Single Connection

1. Open `http://localhost:3000`
2. Verify you see "Total Connections: 1" and "Unique Visitors: 1"

### Test 2: Multiple Tabs (Same User)

1. Open a new tab with `http://localhost:3000`
2. Observe:
   - Total Connections: **2**
   - Unique Visitors: **1** (still the same user)

### Test 3: Multiple Browsers (Different Users)

1. Open the app in a different browser or incognito window
2. Observe both counters increment

### Test 4: Disconnect Behavior

1. Close a tab
2. Watch the counters decrease in real-time in other tabs

## What's Next?

- Read the [Architecture](architecture/ARCHITECTURE.md) documentation
- Explore the [API Reference](api/API.md)
- Check out [Examples](examples/EXAMPLES.md)
- Review [Troubleshooting](TROUBLESHOOTING.md) if you encounter issues

## Quick Tips

💡 **Port Conflicts**: If ports 3000 or 3001 are in use, check the configuration section  
💡 **Browser Compatibility**: SSE works in all modern browsers except IE  
💡 **Development Mode**: The app uses hot-reload for rapid development  
💡 **Cookie Tracking**: Clear cookies to simulate a new unique visitor

## Need Help?

- Check the [FAQ](FAQ.md)
- See [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review [Contributing Guidelines](CONTRIBUTING.md)
