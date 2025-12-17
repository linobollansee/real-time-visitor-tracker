# Installation Guide

Complete installation instructions for the Real-Time Visitor Tracker project.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **RAM**: 512MB available
- **Disk Space**: 500MB for dependencies

### Recommended

- **Node.js**: v20.x LTS
- **npm**: v10.x
- **RAM**: 2GB available
- **Disk Space**: 1GB

### Supported Operating Systems

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+, Debian, Fedora, etc.)

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (SSE not supported)

## Installation Methods

### Method 1: Standard Installation (Recommended)

#### Step 1: Verify Node.js Installation

```bash
node --version
npm --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

#### Step 2: Clone/Download Project

```bash
# If using git
git clone <repository-url>
cd real-time-visitor-tracker

# Or download and extract ZIP
```

#### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

**What gets installed:**

```json
{
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "cookie-parser": "^1.4.7",
  "uuid": "^13.0.0"
}
```

#### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**What gets installed:**

```json
{
  "next": "16.0.10",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@tailwindcss/postcss": "^4.1.18",
  "typescript": "^5.7.2"
}
```

### Method 2: Using Yarn

If you prefer Yarn over npm:

```bash
# Backend
cd backend
yarn install

# Frontend
cd ../frontend
yarn install
```

### Method 3: Using pnpm

For faster installations with pnpm:

```bash
# Install pnpm globally (if not installed)
npm install -g pnpm

# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

## Backend Setup

### Directory Structure

```
backend/
├── node_modules/      # Dependencies (after npm install)
├── package.json       # Project metadata
├── package-lock.json  # Locked dependency versions
└── server.js          # Main server file
```

### Environment Variables (Optional)

Create `.env` file in `backend/` directory:

```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Verify Backend Installation

```bash
cd backend
npm run dev
```

Expected output:

```
Backend server running on http://localhost:3001
SSE endpoint: http://localhost:3001/events
```

Press `Ctrl+C` to stop the server.

## Frontend Setup

### Directory Structure

```
frontend/
├── app/
│   ├── page.tsx       # Main page component
│   ├── layout.tsx     # Root layout
│   └── globals.css    # Global styles
├── node_modules/      # Dependencies
├── package.json       # Project metadata
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS config
├── postcss.config.js  # PostCSS configuration
└── tsconfig.json      # TypeScript config
```

### Environment Variables (Optional)

Create `.env.local` file in `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Verify Frontend Installation

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

Press `Ctrl+C` to stop the server.

## Verification

### 1. Check Dependencies

```bash
# Backend
cd backend
npm list --depth=0

# Frontend
cd frontend
npm list --depth=0
```

### 2. Run Health Check

Start the backend server and check:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "totalConnections": 0,
  "uniqueVisitors": 0,
  "timestamp": "2025-12-17T..."
}
```

### 3. Test Full Application

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:3000`
4. Verify connection counter shows "1"

## Troubleshooting

### Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

```bash
# Find process using port
# Windows
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3001

# Kill the process or change port in code
```

### Node Version Issues

**Error:**

```
error Unsupported engine
```

**Solution:**

```bash
# Use nvm to install correct version
nvm install 20
nvm use 20
```

### Module Not Found

**Error:**

```
Error: Cannot find module 'express'
```

**Solution:**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Permission Errors (Linux/macOS)

**Error:**

```
EACCES: permission denied
```

**Solution:**

```bash
# Don't use sudo, fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# Add to PATH in ~/.bashrc or ~/.zshrc:
export PATH=~/.npm-global/bin:$PATH
```

## Next Steps

✅ Installation complete!

Now proceed to:

- [Getting Started Guide](GETTING_STARTED.md)
- [Architecture Documentation](architecture/ARCHITECTURE.md)
- [API Reference](api/API.md)
