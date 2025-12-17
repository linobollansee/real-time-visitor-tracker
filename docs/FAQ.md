# Frequently Asked Questions (FAQ)

Common questions about the Real-Time Visitor Tracker project.

## General Questions

### What is this project?

A real-time visitor tracking application that displays the number of active users connected to a website using Server-Sent Events (SSE). It tracks both total connections (browser tabs) and unique visitors (individual users).

### What technologies are used?

**Frontend:**

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS v4

**Backend:**

- Express.js 5
- Node.js
- Server-Sent Events (SSE)

### Is this production-ready?

This is a **demo/prototype** project. For production use, you'd need:

- Persistent storage (Redis/Database)
- Authentication/Authorization
- HTTPS/SSL
- Rate limiting
- Monitoring and logging
- Load balancing support

---

## Technical Questions

### Why Server-Sent Events instead of WebSockets?

**Advantages of SSE:**

- ✅ Simpler to implement
- ✅ Built-in automatic reconnection
- ✅ Works over standard HTTP
- ✅ Better firewall compatibility
- ✅ Less overhead for one-way communication

**When to use WebSockets instead:**

- Need bidirectional communication
- Real-time gaming or chat
- Binary data transfer

### Why use cookies instead of localStorage?

Cookies are automatically sent with HTTP requests, which is essential for SSE connections to identify users. LocalStorage requires JavaScript to manually include data in requests.

### How does unique visitor tracking work?

1. User visits for the first time
2. Backend generates a UUID v4
3. UUID stored in `visitorId` cookie (30-day expiry)
4. Cookie sent with all subsequent requests
5. Backend uses cookie to identify unique users
6. Multiple tabs = same cookie = 1 unique visitor

### What happens when the server restarts?

**Current behavior:**

- All connection data is lost (in-memory storage)
- Counters reset to 0
- Clients automatically reconnect
- Cookies persist on client side

**For production:**

- Use Redis to persist state
- Implement graceful shutdown
- Store session data in database

### Can this scale to millions of users?

**Current implementation:** No. Limited by:

- Single server (no horizontal scaling)
- In-memory storage
- Node.js event loop constraints

**For high scale:**

- Use Redis for shared state
- Load balancer with sticky sessions
- Multiple backend instances
- CDN for frontend
- Database for analytics

---

## Usage Questions

### How do I test with multiple users?

**Option 1: Multiple tabs (same user)**

```
Open multiple tabs in same browser
→ Total Connections increase
→ Unique Visitors stays at 1
```

**Option 2: Incognito mode (new user)**

```
Open incognito/private window
→ Both counters increase
```

**Option 3: Different browsers (new users)**

```
Open in Chrome, Firefox, Safari, etc.
→ Each browser = new unique visitor
```

**Option 4: Different devices**

```
Open on phone, tablet, laptop
→ Most accurate test
```

### Why does the count show as 1 in multiple tabs?

**If you see:**

- Total Connections: 1
- Unique Visitors: 1

**Possible causes:**

1. Only one tab is actually connected
2. Other tabs failed to connect (check console)
3. EventSource not properly initialized

**Expected behavior:**

- Total Connections: 3 (if 3 tabs open)
- Unique Visitors: 1 (same user)

### How do I reset my visitor ID?

**Method 1: Clear cookies**

```
Browser Settings → Privacy → Clear Cookies
```

**Method 2: Developer Tools**

```
F12 → Application → Cookies → Delete visitorId
```

**Method 3: Incognito mode**

```
Open new incognito/private window
```

### Can I track visitors across multiple domains?

**Short answer:** Not with cookies alone.

**Long answer:** You'd need:

- Third-party cookies (being phased out by browsers)
- Or alternative tracking methods (fingerprinting, etc.)
- Or centralized auth system

### What's the maximum number of connections?

**Theoretical limits:**

- Browser: ~6 SSE connections per domain
- OS: ~65,000 file descriptors
- Node.js: Configurable via `ulimit`

**Practical limits:**

- Depends on available RAM
- Network bandwidth
- CPU capacity

**Current implementation:** No hard limit set

---

## Connection Questions

### Why does it say "Reconnecting..."?

**Common causes:**

1. Backend server stopped
2. Network connection lost
3. Browser tab was sleeping
4. Firewall blocking connection

**Solution:** EventSource automatically reconnects. Wait a few seconds.

### How often does it update?

**Immediately** when:

- New connection established
- Existing connection closes

**Also:**

- Heartbeat every 15 seconds (keep-alive only, no data)

### Does it work offline?

**No.** SSE requires an active internet connection. When offline:

- Status shows "Reconnecting..."
- Auto-reconnects when connection restored

### What happens if I minimize the browser?

**Desktop:** Connection stays active

**Mobile:** Connection may be paused by OS to save battery. Will reconnect when app becomes active.

---

## Development Questions

### How do I change the port?

**Backend:**

```javascript
// In server.js
const PORT = process.env.PORT || 3002; // Change 3001 → 3002
```

**Frontend:**

```typescript
// In page.tsx
const eventSource = new EventSource("http://localhost:3002/events", {
  withCredentials: true,
});
```

### Can I add authentication?

**Yes.** Example approaches:

**1. JWT tokens:**

```javascript
// Backend
const token = req.headers.authorization;
// Verify token...

// Frontend
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**2. Session-based:**

```javascript
// Use express-session
// Check session before allowing SSE connection
```

### How do I add more data to the broadcast?

**Backend modification:**

```javascript
function broadcastCount() {
  const data = JSON.stringify({
    totalConnections,
    uniqueVisitors,
    timestamp: new Date().toISOString(),
    // Add more fields:
    serverUptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    customMetric: someValue,
  });

  activeConnections.forEach((responses) => {
    responses.forEach((res) => {
      res.write(`data: ${data}\n\n`);
    });
  });
}
```

**Frontend modification:**

```typescript
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Server uptime:", data.serverUptime);
  console.log("Memory usage:", data.memoryUsage);
};
```

### Can I use this with other frameworks?

**Yes!** The backend is framework-agnostic.

**Frontend alternatives:**

- **Vue.js:** Use EventSource in `onMounted` hook
- **Angular:** Use in `ngOnInit` lifecycle method
- **Svelte:** Use in `onMount` function
- **Vanilla JS:** Just use EventSource directly

**Backend alternatives:**

- **Fastify:** Similar implementation
- **Koa:** Use with `koa-sse-stream`
- **Nest.js:** Use SSE support
- **Python Flask:** Use `flask-sse`

---

## Deployment Questions

### Can I deploy this to production?

**You can, but you should add:**

- [ ] HTTPS (SSL certificates)
- [ ] Environment variables
- [ ] Persistent storage (Redis/Database)
- [ ] Error logging (Sentry, LogRocket)
- [ ] Monitoring (Datadog, New Relic)
- [ ] Rate limiting
- [ ] Security headers
- [ ] Input validation
- [ ] CORS configuration for production domain

### Where can I deploy this?

**Backend:**

- ✅ Heroku
- ✅ Railway
- ✅ Render
- ✅ AWS EC2/ECS
- ✅ Google Cloud Run
- ✅ Azure App Service
- ✅ DigitalOcean Droplets
- ⚠️ Vercel/Netlify (serverless functions have timeout limits)

**Frontend:**

- ✅ Vercel (recommended for Next.js)
- ✅ Netlify
- ✅ AWS S3 + CloudFront
- ✅ Firebase Hosting
- ✅ GitHub Pages (with static export)

### Do I need a database?

**For demo:** No, in-memory storage works fine

**For production:** Yes, recommended:

- **Redis:** Fast, perfect for real-time data
- **PostgreSQL:** For analytics and history
- **MongoDB:** Flexible schema for events

### What about environment variables?

**Backend `.env`:**

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
COOKIE_SECRET=your-secret-key
REDIS_URL=redis://...
```

**Frontend `.env.local`:**

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Browser Compatibility

### Which browsers are supported?

| Browser | Version | Supported |
| ------- | ------- | --------- |
| Chrome  | 6+      | ✅ Yes    |
| Firefox | 6+      | ✅ Yes    |
| Safari  | 5+      | ✅ Yes    |
| Edge    | 79+     | ✅ Yes    |
| Opera   | 11+     | ✅ Yes    |
| IE      | All     | ❌ No     |

### What about mobile browsers?

**iOS Safari:** ✅ Supported (iOS 5+)  
**Chrome Android:** ✅ Supported  
**Firefox Android:** ✅ Supported  
**Samsung Internet:** ✅ Supported

**Note:** Mobile browsers may pause connections when app is backgrounded.

---

## Security Questions

### Is the visitor ID secure?

**Current implementation:**

- UUID v4 (random, unpredictable)
- HttpOnly cookie (not accessible via JavaScript)
- SameSite=Lax (CSRF protection)

**For production, also add:**

- Secure flag (HTTPS only)
- Cookie signing/encryption
- Regular rotation

### Can users fake their visitor ID?

**Technically yes.** Users can:

- Modify cookies in DevTools
- Use browser extensions
- Send custom requests

**For tracking accuracy:**

- Use fingerprinting (IP, user agent, etc.)
- Combine with server-side validation
- Add bot detection

### Is there any personal data collected?

**Currently collected:**

- Random UUID (not personally identifiable)
- Connection timestamp

**Not collected:**

- IP addresses (could be logged by proxy/load balancer)
- User agent
- Location
- Behavioral data

**For GDPR compliance:**

- Add privacy policy
- Cookie consent banner
- Data retention policy
- User data deletion endpoint

---

## Performance Questions

### How much bandwidth does this use?

**Per connection:**

- Initial: ~500 bytes (HTTP headers)
- Per update: ~80-100 bytes (JSON payload)
- Heartbeat: ~15 bytes every 15 seconds

**Example calculation:**

- 100 users, 1 update/minute
- 100 × 100 bytes × 60 = 600 KB/hour
- Plus heartbeats: 100 × 15 bytes × 240 = 360 KB/hour
- **Total: ~1 MB/hour for 100 users**

### Does this affect page load time?

**Minimal impact:**

- EventSource connection is non-blocking
- Doesn't affect initial page render
- Connects after page load completes

### How much memory does it use?

**Backend (Node.js):**

- Base: ~30 MB
- Per connection: ~5-10 KB
- 1000 connections: ~40-50 MB

**Frontend:**

- Single EventSource: ~1-2 MB
- State management: Negligible

---

## Comparison Questions

### How is this different from Google Analytics?

| Feature         | This Project           | Google Analytics    |
| --------------- | ---------------------- | ------------------- |
| Real-time       | ✅ Instant             | ⚠️ 1-2 min delay    |
| Active users    | ✅ Current connections | ⚠️ Last 5/30 min    |
| Setup           | ✅ Self-hosted         | ❌ Third-party      |
| Privacy         | ✅ Your control        | ❌ Google's servers |
| Historical data | ❌ No persistence      | ✅ Full history     |
| Page views      | ❌ Not tracked         | ✅ Detailed         |

### How is this different from Firebase Presence?

**Similarities:**

- Both track active users
- Both use real-time connections

**Differences:**

- Firebase: WebSocket-based, requires account, paid service
- This project: SSE-based, self-hosted, free

---

## Contribution Questions

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Can I contribute?

**Yes!** Contributions are welcome. Please:

1. Read contributing guidelines
2. Open an issue first for major changes
3. Follow code style
4. Add tests if applicable
5. Update documentation

### What can I work on?

Check the [Contributing Guide](CONTRIBUTING.md) for ideas and current priorities.

---

## Still have questions?

- 📖 Read the [Documentation](GETTING_STARTED.md)
- 🐛 Check [Troubleshooting](TROUBLESHOOTING.md)
- 💻 Review [Examples](examples/EXAMPLES.md)
- 🏗️ Study [Architecture](architecture/ARCHITECTURE.md)
