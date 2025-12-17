# Architecture Documentation

## Overview

This document describes the architecture of the Real-Time Visitor Tracker application, including system design, data flow, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────┐         SSE          ┌─────────────┐
│             │ ◄─────────────────── │             │
│   Browser   │                      │   Express   │
│  (Next.js)  │ ─────────────────► │   Backend   │
│             │    HTTP/HTTPS        │             │
└─────────────┘                      └─────────────┘
     │                                      │
     │                                      │
     ▼                                      ▼
┌─────────────┐                      ┌─────────────┐
│ EventSource │                      │  In-Memory  │
│     API     │                      │   Storage   │
└─────────────┘                      └─────────────┘
```

### Component Breakdown

#### 1. Frontend (Next.js + React)

**Technology Stack:**

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

**Key Files:**

- `app/page.tsx` - Main dashboard component
- `app/layout.tsx` - Root layout with global styles
- `app/globals.css` - Tailwind directives

**Responsibilities:**

- Establish SSE connection via EventSource
- Display visitor counts in real-time
- Handle connection status (connected/reconnecting)
- Provide user interface

#### 2. Backend (Express.js)

**Technology Stack:**

- Express 5
- Node.js
- Cookie-parser
- UUID v4
- CORS

**Key File:**

- `server.js` - Main server implementation

**Responsibilities:**

- Serve SSE endpoint (`/events`)
- Track active connections
- Manage session cookies
- Broadcast updates to all clients
- Maintain in-memory state

## Data Flow

### Connection Establishment Flow

```
1. User opens browser
   │
   ▼
2. Next.js app loads
   │
   ▼
3. EventSource connects to /events
   │
   ▼
4. Backend checks for visitorId cookie
   │
   ├─► No cookie: Generate UUID, set cookie
   │
   └─► Has cookie: Use existing session ID
   │
   ▼
5. Backend adds connection to Map
   │
   ▼
6. Backend broadcasts count to ALL clients
   │
   ▼
7. All connected browsers update UI
```

### Disconnect Flow

```
1. User closes tab/browser
   │
   ▼
2. EventSource connection closes
   │
   ▼
3. Backend 'close' event fires
   │
   ▼
4. Backend removes connection from Map
   │
   ▼
5. Backend checks if session has more connections
   │
   ├─► Yes: Keep session in Map
   │
   └─► No: Remove session from Map
   │
   ▼
6. Backend broadcasts updated count
   │
   ▼
7. Remaining clients update UI
```

## Core Components

### Backend Components

#### 1. Connection Manager

```javascript
const activeConnections = new Map();
// Structure: Map<sessionId, Set<response objects>>

let totalConnections = 0;
// Simple counter for total connections
```

**Purpose:** Track all active SSE connections grouped by session

**Design Decision:** Using a Map allows O(1) lookup and Set prevents duplicate connections

#### 2. Session Manager

```javascript
function getSessionId(req, res) {
  let sessionId = req.cookies.visitorId;

  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie("visitorId", sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return sessionId;
}
```

**Purpose:** Identify unique visitors across multiple tabs

**Design Decisions:**

- **UUID v4**: Cryptographically random, no collisions
- **30-day expiry**: Balance between persistence and privacy
- **httpOnly**: Security against XSS attacks
- **sameSite: 'lax'**: CSRF protection while allowing normal navigation

#### 3. Broadcast Manager

```javascript
function broadcastCount() {
  const uniqueVisitors = activeConnections.size;
  const data = JSON.stringify({
    totalConnections,
    uniqueVisitors,
    timestamp: new Date().toISOString(),
  });

  activeConnections.forEach((responses) => {
    responses.forEach((res) => {
      res.write(`data: ${data}\n\n`);
    });
  });
}
```

**Purpose:** Send updates to all connected clients

**Design Decision:** Iterate through all connections to ensure consistency

#### 4. Heartbeat Mechanism

```javascript
const heartbeatInterval = setInterval(() => {
  res.write(": heartbeat\n\n");
}, 15000);
```

**Purpose:** Keep SSE connection alive

**Design Decisions:**

- **15-second interval**: Standard practice, prevents proxy timeouts
- **SSE comment format**: `: comment` doesn't trigger events
- **Cleanup**: `clearInterval` on disconnect prevents memory leaks

### Frontend Components

#### 1. EventSource Client

```typescript
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true,
});
```

**Purpose:** Establish persistent SSE connection

**Design Decisions:**

- **withCredentials: true**: Send cookies for session tracking
- **Native API**: No external libraries needed
- **Auto-reconnect**: Built into EventSource specification

#### 2. State Management

```typescript
const [visitorCount, setVisitorCount] = useState({
  totalConnections: 0,
  uniqueVisitors: 0,
});
const [connectionStatus, setConnectionStatus] = useState("Connecting...");
const [lastUpdate, setLastUpdate] = useState<string>("");
```

**Purpose:** Manage UI state reactively

**Design Decision:** React hooks for simple, declarative state management

#### 3. Message Handler

```typescript
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setVisitorCount({
    totalConnections: data.totalConnections,
    uniqueVisitors: data.uniqueVisitors,
  });
  setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
};
```

**Purpose:** Process incoming SSE messages

**Design Decision:** Parse JSON and update state to trigger re-render

## Technical Decisions

### Why Server-Sent Events (SSE)?

**Advantages:**

- ✅ Simpler than WebSockets
- ✅ Built-in auto-reconnect
- ✅ Standard HTTP protocol
- ✅ Works through firewalls
- ✅ Native browser API
- ✅ Lightweight

**Trade-offs:**

- ❌ Unidirectional (server → client only)
- ❌ Limited browser support (no IE)
- ❌ Text-based (JSON overhead)

**Verdict:** Perfect for this use case (push-only updates)

### Why In-Memory Storage?

**Advantages:**

- ✅ Fast O(1) lookups
- ✅ No database setup required
- ✅ Simple implementation
- ✅ Sufficient for demo/small scale

**Trade-offs:**

- ❌ Data lost on restart
- ❌ Not scalable across multiple servers
- ❌ No persistence

**Verdict:** Acceptable for the challenge requirements

### Why UUID v4 for Session IDs?

**Alternatives Considered:**

| Method             | Pros             | Cons                       | Verdict        |
| ------------------ | ---------------- | -------------------------- | -------------- |
| Sequential IDs     | Simple           | Predictable, security risk | ❌             |
| Random strings     | No dependencies  | Collision risk             | ❌             |
| crypto.randomBytes | Built-in         | More code needed           | ✅ Alternative |
| UUID v4            | Standard, proven | External dependency        | ✅ **Chosen**  |

### Why Cookie-Based Sessions?

**Alternatives Considered:**

| Method         | Pros                  | Cons                          | Verdict       |
| -------------- | --------------------- | ----------------------------- | ------------- |
| LocalStorage   | Easy to implement     | Not sent with requests        | ❌            |
| SessionStorage | Tab-specific          | Defeats "unique visitor" goal | ❌            |
| Cookies        | Automatic, persistent | Requires backend parsing      | ✅ **Chosen** |
| URL Parameters | Stateless             | Complex, poor UX              | ❌            |

## Scalability Considerations

### Current Limitations

1. **Single Server**: No horizontal scaling
2. **In-Memory State**: Lost on restart
3. **No Load Balancing**: Sticky sessions required
4. **Connection Limits**: OS-dependent (typically ~65k)

### Future Improvements

#### For Production Scale:

```
┌─────────┐                  ┌─────────────┐
│ Browser │ ────────────────► │ Load        │
└─────────┘                  │ Balancer    │
                             └──────┬──────┘
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
              ┌───────────┐  ┌───────────┐  ┌───────────┐
              │  Node 1   │  │  Node 2   │  │  Node 3   │
              └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                             ┌───────────┐
                             │   Redis   │
                             │  Pub/Sub  │
                             └───────────┘
```

**Improvements:**

- Redis for shared state
- Redis Pub/Sub for broadcasting
- Sticky sessions on load balancer
- Session persistence in Redis

## Security Considerations

### Implemented

- ✅ **httpOnly cookies**: Prevents XSS attacks
- ✅ **sameSite: 'lax'**: CSRF protection
- ✅ **CORS**: Restricts origin to localhost:3000
- ✅ **UUID randomness**: Unpredictable session IDs

### Missing (Production TODO)

- ❌ HTTPS enforcement
- ❌ Rate limiting
- ❌ Input validation
- ❌ Cookie encryption
- ❌ CSP headers

## Performance Characteristics

### Time Complexity

- **Add connection**: O(1)
- **Remove connection**: O(1)
- **Broadcast**: O(n × m) where n = sessions, m = connections per session
- **Cookie lookup**: O(1)

### Space Complexity

- **Per session**: O(1) - UUID string
- **Per connection**: O(1) - Response object reference
- **Total**: O(n + c) where n = unique visitors, c = total connections

### Network Overhead

- **Initial connection**: ~500 bytes (HTTP headers)
- **Per message**: ~80-100 bytes (JSON payload)
- **Heartbeat**: ~15 bytes every 15 seconds

## Error Handling

### Frontend

```typescript
eventSource.onerror = (error) => {
  console.error("SSE error:", error);
  setConnectionStatus("Reconnecting...");
  // EventSource auto-reconnects
};
```

### Backend

```javascript
req.on("close", () => {
  clearInterval(heartbeatInterval);
  // Cleanup connection
  broadcastCount();
});
```

## Testing Strategy

### Manual Testing

1. **Single connection test**
2. **Multiple tabs test**
3. **Multiple browsers test**
4. **Disconnect test**
5. **Server restart test**

### Automated Testing (TODO)

- Unit tests for session management
- Integration tests for SSE endpoint
- E2E tests with Playwright
- Load tests with Artillery

## Deployment Architecture

### Development

```
localhost:3001 (Backend)
localhost:3000 (Frontend)
```

### Production (Recommended)

```
api.example.com (Backend - Node.js)
www.example.com (Frontend - Vercel/Netlify)
```

## Further Reading

- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [UUID RFC 4122](https://tools.ietf.org/html/rfc4122)
- [Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)
