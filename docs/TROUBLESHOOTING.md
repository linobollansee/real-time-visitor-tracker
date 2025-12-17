# Troubleshooting Guide

Common issues and their solutions for the Real-Time Visitor Tracker.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Connection Issues](#connection-issues)
- [Browser Issues](#browser-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Problem: `npm install` fails

#### Error Message

```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

#### Solution

Make sure you're in the correct directory:

```bash
# For backend
cd backend
npm install

# For frontend
cd frontend
npm install
```

---

### Problem: Node version incompatibility

#### Error Message

```
error Unsupported engine
The engine "node" is incompatible with this module
```

#### Solution

1. Check your Node version:

```bash
node --version
```

2. Install correct version (v18+):

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

---

### Problem: Permission denied (Linux/macOS)

#### Error Message

```
EACCES: permission denied
```

#### Solution

**DON'T use `sudo npm install`**. Instead, fix npm permissions:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## Backend Issues

### Problem: Port 3001 already in use

#### Error Message

```
Error: listen EADDRINUSE: address already in use :::3001
```

#### Solution 1: Kill the process using the port

**Windows:**

```powershell
# Find process
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**macOS/Linux:**

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Solution 2: Change the port

Edit `backend/server.js`:

```javascript
const PORT = process.env.PORT || 3002; // Changed from 3001
```

---

### Problem: Backend crashes immediately

#### Error Message

```
Cannot find module 'express'
```

#### Solution

Reinstall dependencies:

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: CORS errors in console

#### Error Message

```
Access to XMLHttpRequest blocked by CORS policy
```

#### Solution

1. Verify backend CORS configuration in `server.js`:

```javascript
app.use(
  cors({
    origin: "http://localhost:3000", // Must match frontend URL
    credentials: true,
  })
);
```

2. Make sure frontend is running on port 3000

3. Clear browser cache and cookies

---

### Problem: Backend not logging connections

#### Symptom

No console output when opening the app

#### Solution

1. Verify backend is running:

```bash
curl http://localhost:3001/health
```

2. Check if frontend is connecting to correct URL
3. Look for JavaScript errors in browser console

---

## Frontend Issues

### Problem: White screen / blank page

#### Solution 1: Check for build errors

```bash
cd frontend
npm run dev
```

Look for TypeScript or React errors in terminal

#### Solution 2: Clear Next.js cache

```bash
cd frontend
rm -rf .next
npm run dev
```

#### Solution 3: Check browser console

Press F12 and look for JavaScript errors

---

### Problem: Tailwind CSS not working

#### Error Message

```
Error evaluating Node.js code
Error: It looks like you're trying to use `tailwindcss` directly
```

#### Solution

Ensure `postcss.config.js` uses the correct plugin:

```javascript
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // Correct for Tailwind v4
    autoprefixer: {},
  },
};
```

If using older Tailwind version:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {}, // For Tailwind v3
    autoprefixer: {},
  },
};
```

---

### Problem: Hot reload not working

#### Symptom

Changes to code don't reflect in browser

#### Solution

1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Restart dev server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

3. Clear browser cache
4. Check if file watcher limit exceeded (Linux):

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### Problem: TypeScript errors

#### Error Message

```
Type 'string' is not assignable to type 'number'
```

#### Solution

1. Check your code matches types
2. Run TypeScript compiler:

```bash
npx tsc --noEmit
```

3. Restart TypeScript server in VS Code:
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## Connection Issues

### Problem: EventSource not connecting

#### Symptom

Connection status shows "Connecting..." forever

#### Solution 1: Check backend is running

```bash
curl http://localhost:3001/health
```

#### Solution 2: Check browser console for errors

```
EventSource's response has a MIME type ("text/html") that is not "text/event-stream"
```

This means backend isn't sending correct headers.

#### Solution 3: Verify URL is correct

```typescript
// Should match backend URL exactly
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true,
});
```

---

### Problem: Connection keeps reconnecting

#### Symptom

Constantly shows "Reconnecting..."

#### Possible Causes & Solutions

1. **Backend crashed**: Check backend terminal for errors

2. **Network issue**: Check firewall/antivirus settings

3. **Heartbeat not working**: Verify backend sends heartbeats:

```javascript
setInterval(() => {
  res.write(": heartbeat\n\n");
}, 15000);
```

4. **Browser limit**: Close other tabs using SSE connections

---

### Problem: Cookies not being sent

#### Symptom

Every refresh shows as a new unique visitor

#### Solution

Ensure `withCredentials` is set:

```typescript
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true, // REQUIRED for cookies
});
```

Also verify CORS allows credentials:

```javascript
cors({
  origin: "http://localhost:3000",
  credentials: true, // REQUIRED
});
```

---

### Problem: Count doesn't update in real-time

#### Solution 1: Check browser console

Look for JavaScript errors preventing state updates

#### Solution 2: Verify EventSource message handler

```typescript
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data); // Add logging
  setVisitorCount(data);
};
```

#### Solution 3: Check backend broadcast function

Ensure `broadcastCount()` is called on connect/disconnect

---

## Browser Issues

### Problem: SSE not supported

#### Error Message

```
EventSource is not defined
```

#### Solution

You're using Internet Explorer, which doesn't support SSE.

**Browsers that support SSE:**

- ✅ Chrome 6+
- ✅ Firefox 6+
- ✅ Safari 5+
- ✅ Edge 79+
- ❌ Internet Explorer (all versions)

**Workaround:** Use a polyfill:

```bash
npm install event-source-polyfill
```

```typescript
import { EventSourcePolyfill } from "event-source-polyfill";
```

---

### Problem: Incognito mode shows same visitor ID

#### Explanation

This is expected behavior. Cookies persist within the incognito session.

#### Testing different visitors

- Use different browsers (Chrome, Firefox, Safari)
- Use actual different devices
- Clear cookies between tests

---

### Problem: Developer tools breaks connection

#### Symptom

Connection works until opening DevTools

#### Solution

This is a browser bug in some versions. Try:

1. Open DevTools before loading the page
2. Update browser to latest version
3. Disable DevTools throttling

---

## Performance Issues

### Problem: High memory usage

#### Cause

Memory leak from not cleaning up EventSource

#### Solution

Always close EventSource on unmount:

```typescript
useEffect(() => {
  const eventSource = new EventSource(...);

  return () => {
    eventSource.close(); // IMPORTANT
  };
}, []);
```

---

### Problem: Backend slowing down

#### Cause

Too many concurrent connections

#### Solution 1: Implement connection limits

```javascript
const MAX_CONNECTIONS = 1000;

if (totalConnections >= MAX_CONNECTIONS) {
  res.status(503).send("Server at capacity");
  return;
}
```

#### Solution 2: Add rate limiting

```bash
npm install express-rate-limit
```

---

### Problem: Messages delayed

#### Cause

Network buffering or proxy

#### Solution

Ensure anti-buffering header is set:

```javascript
res.setHeader("X-Accel-Buffering", "no");
```

For nginx, add to config:

```nginx
proxy_buffering off;
```

---

## Debugging Tips

### Enable verbose logging

**Backend:**

```javascript
app.get("/events", (req, res) => {
  console.log(`[${new Date().toISOString()}] New connection from ${req.ip}`);
  // ... rest of code
});
```

**Frontend:**

```typescript
eventSource.onopen = () => {
  console.log("[SSE] Connection opened");
};

eventSource.onmessage = (event) => {
  console.log("[SSE] Message received:", event.data);
};

eventSource.onerror = (error) => {
  console.error("[SSE] Error:", error);
  console.log("[SSE] ReadyState:", eventSource.readyState);
};
```

### Check EventSource state

```typescript
console.log(eventSource.readyState);
// 0 = CONNECTING
// 1 = OPEN
// 2 = CLOSED
```

### Monitor network traffic

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "EventStream" or look for `/events`
4. Click on the request
5. View "EventStream" tab to see messages in real-time

### Test with cURL

```bash
# Test SSE endpoint
curl -N -H "Accept: text/event-stream" http://localhost:3001/events

# Test health endpoint
curl http://localhost:3001/health
```

---

## Still Having Issues?

### Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install` in both directories)
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] No CORS errors in console
- [ ] Modern browser (not IE)
- [ ] Cookies enabled in browser
- [ ] Firewall not blocking connections

### Get Help

1. Check [FAQ](FAQ.md)
2. Review [Examples](examples/EXAMPLES.md)
3. Read [API Documentation](api/API.md)
4. Check [GitHub Issues](../../../issues)

### Create a Bug Report

Include:

- Operating system
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Browser and version
- Error messages (full stack trace)
- Steps to reproduce
- Screenshots if applicable
