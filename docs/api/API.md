# API Reference

Complete API documentation for the Real-Time Visitor Tracker backend.

## Base URL

```
http://localhost:3001
```

## Endpoints

### 1. SSE Events Endpoint

**GET** `/events`

Establishes a Server-Sent Events connection for real-time visitor count updates.

#### Request

**Headers:**

```http
Cookie: visitorId=<uuid>  (optional, auto-generated if not present)
```

**Example:**

```bash
curl -N http://localhost:3001/events
```

With EventSource (JavaScript):

```javascript
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true,
});
```

#### Response

**Status Code:** `200 OK`

**Headers:**

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
Set-Cookie: visitorId=<uuid>; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax
```

**Body Format:** SSE stream

```
data: {"totalConnections":1,"uniqueVisitors":1,"timestamp":"2025-12-17T10:30:45.123Z"}

data: {"totalConnections":2,"uniqueVisitors":2,"timestamp":"2025-12-17T10:30:50.456Z"}

: heartbeat

data: {"totalConnections":1,"uniqueVisitors":1,"timestamp":"2025-12-17T10:31:00.789Z"}
```

#### Response Fields

| Field              | Type     | Description                                       |
| ------------------ | -------- | ------------------------------------------------- |
| `totalConnections` | `number` | Total number of active SSE connections (all tabs) |
| `uniqueVisitors`   | `number` | Number of unique visitors (distinct session IDs)  |
| `timestamp`        | `string` | ISO 8601 timestamp of the update                  |

#### Heartbeat

Every 15 seconds, the server sends a heartbeat comment:

```
: heartbeat
```

This keeps the connection alive and prevents timeouts.

#### Connection Lifecycle

1. **Connect**: Client connects → backend generates/reads session ID
2. **Initial Message**: Backend immediately sends current count
3. **Updates**: Backend sends message whenever count changes
4. **Heartbeats**: Backend sends keep-alive comment every 15s
5. **Disconnect**: Client closes → backend updates count and broadcasts

#### Example Implementation (Frontend)

```typescript
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true,
});

eventSource.onopen = () => {
  console.log("Connected to SSE");
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Total Connections:", data.totalConnections);
  console.log("Unique Visitors:", data.uniqueVisitors);
  console.log("Timestamp:", data.timestamp);
};

eventSource.onerror = (error) => {
  console.error("SSE Error:", error);
  // EventSource will automatically attempt to reconnect
};

// Cleanup
eventSource.close();
```

#### Error Handling

The EventSource API automatically handles reconnection. If the connection is lost:

1. Browser waits 3 seconds (default)
2. Automatically attempts to reconnect
3. Sends `Last-Event-ID` header if available
4. Continues retrying with exponential backoff

#### CORS Configuration

The endpoint accepts requests from:

```
Origin: http://localhost:3000
```

Credentials are enabled to support cookie-based sessions.

---

### 2. Health Check Endpoint

**GET** `/health`

Returns current server status and statistics.

#### Request

```bash
curl http://localhost:3001/health
```

**Headers:** None required

**Query Parameters:** None

#### Response

**Status Code:** `200 OK`

**Headers:**

```http
Content-Type: application/json
```

**Body:**

```json
{
  "status": "ok",
  "totalConnections": 5,
  "uniqueVisitors": 3,
  "timestamp": "2025-12-17T10:30:45.123Z"
}
```

#### Response Fields

| Field              | Type     | Description                          |
| ------------------ | -------- | ------------------------------------ |
| `status`           | `string` | Server status (always "ok")          |
| `totalConnections` | `number` | Current number of active connections |
| `uniqueVisitors`   | `number` | Current number of unique visitors    |
| `timestamp`        | `string` | ISO 8601 timestamp of the response   |

#### Example Usage

**JavaScript (fetch):**

```javascript
fetch("http://localhost:3001/health")
  .then((res) => res.json())
  .then((data) => {
    console.log("Server Status:", data.status);
    console.log("Active Connections:", data.totalConnections);
    console.log("Unique Visitors:", data.uniqueVisitors);
  });
```

**cURL:**

```bash
curl -X GET http://localhost:3001/health | jq
```

**PowerShell:**

```powershell
Invoke-RestMethod -Uri 'http://localhost:3001/health' -Method Get
```

#### Use Cases

- **Monitoring**: Check if server is running
- **Metrics**: Get current visitor statistics
- **Health Checks**: Load balancer health checks
- **Testing**: Verify server is responsive

---

## Cookie Details

### visitorId Cookie

The server sets a `visitorId` cookie to track unique visitors.

#### Cookie Attributes

| Attribute  | Value               | Purpose                                                          |
| ---------- | ------------------- | ---------------------------------------------------------------- |
| `Name`     | `visitorId`         | Cookie identifier                                                |
| `Value`    | UUID v4             | Unique session ID (e.g., `550e8400-e29b-41d4-a716-446655440000`) |
| `Max-Age`  | `2592000` (30 days) | Cookie expiration                                                |
| `Path`     | `/`                 | Available to all routes                                          |
| `HttpOnly` | `true`              | Not accessible via JavaScript (XSS protection)                   |
| `SameSite` | `Lax`               | CSRF protection                                                  |
| `Secure`   | `false` (dev)       | Should be `true` in production (HTTPS only)                      |

#### Cookie Lifecycle

1. **First Visit**: No cookie → server generates UUID → sets cookie
2. **Subsequent Visits**: Cookie present → server reads existing UUID
3. **Multiple Tabs**: Same cookie shared → counted as 1 unique visitor
4. **After 30 Days**: Cookie expires → treated as new visitor
5. **Clear Cookies**: Cookie deleted → treated as new visitor

#### Example Cookie Header

```http
Set-Cookie: visitorId=a1b2c3d4-e5f6-7890-abcd-ef1234567890; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax
```

---

## Error Responses

### CORS Error

**Scenario**: Request from unauthorized origin

**Response:**

```
Access to XMLHttpRequest at 'http://localhost:3001/events' from origin
'http://example.com' has been blocked by CORS policy
```

**Solution**: Update CORS configuration in `server.js`

### Connection Refused

**Scenario**: Backend server not running

**Error:**

```
Failed to connect to localhost:3001
```

**Solution**: Start the backend server

### Port Already in Use

**Scenario**: Port 3001 already occupied

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution**: Kill process using port or change `PORT` in server

---

## Rate Limiting

**Current Implementation:** None

**Recommendation for Production:**

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/events", limiter);
```

---

## Authentication

**Current Implementation:** None (public endpoint)

**For Production:** Consider adding:

- API keys
- JWT tokens
- OAuth 2.0
- IP whitelisting

---

## WebSocket Alternative (Not Implemented)

While this project uses SSE, here's how it would differ with WebSockets:

| Feature         | SSE (Current)      | WebSocket (Alternative) |
| --------------- | ------------------ | ----------------------- |
| Direction       | Server → Client    | Bidirectional           |
| Protocol        | HTTP               | WS/WSS                  |
| Reconnection    | Automatic          | Manual implementation   |
| Browser Support | Modern browsers    | All browsers            |
| Complexity      | Simple             | More complex            |
| Use Case        | Push notifications | Chat, gaming            |

---

## Testing the API

### Using cURL

```bash
# SSE endpoint (will stream continuously)
curl -N -H "Accept: text/event-stream" http://localhost:3001/events

# Health check
curl http://localhost:3001/health
```

### Using Postman

1. Create new request
2. Set method to `GET`
3. Set URL to `http://localhost:3001/events`
4. Send request
5. View streaming responses

### Using HTTPie

```bash
# Install httpie
pip install httpie

# Test health endpoint
http GET localhost:3001/health

# Test SSE endpoint
http --stream GET localhost:3001/events
```

### Using Browser DevTools

1. Open browser DevTools (F12)
2. Go to Network tab
3. Open application
4. Look for `events` request
5. Click on it to see SSE messages

---

## SDK / Client Libraries

### JavaScript/TypeScript

Native `EventSource` API (no library needed):

```typescript
const eventSource = new EventSource("http://localhost:3001/events", {
  withCredentials: true,
});
```

### Python

Using `sseclient-py`:

```python
import sseclient
import requests

response = requests.get('http://localhost:3001/events', stream=True)
client = sseclient.SSEClient(response)

for event in client.events():
    print(f"Data: {event.data}")
```

### Go

Using `r3labs/sse`:

```go
import "github.com/r3labs/sse/v2"

client := sse.NewClient("http://localhost:3001/events")

client.Subscribe("messages", func(msg *sse.Event) {
    fmt.Printf("Data: %s\n", msg.Data)
})
```

---

## Versioning

**Current Version:** 1.0.0

**API Stability:** Stable

**Breaking Changes:** None planned

**Future Versions:**

- v1.1.0: Add filtering options
- v2.0.0: Add authentication

---

## Support

For API issues:

- Check [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Review [Examples](../examples/EXAMPLES.md)
- See [FAQ](../FAQ.md)
