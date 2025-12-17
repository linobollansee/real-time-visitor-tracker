const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// In-memory storage for active connections
const activeConnections = new Map(); // Map<sessionId, Set<response objects>>
let totalConnections = 0;

// Helper function to get or create session ID
function getSessionId(req, res) {
  let sessionId = req.cookies.visitorId;

  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie("visitorId", sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return sessionId;
}

// Broadcast count to all connected clients
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

// SSE endpoint
app.get("/events", (req, res) => {
  // Get or create session ID
  const sessionId = getSessionId(req, res);

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for nginx

  // Add this connection to active connections
  if (!activeConnections.has(sessionId)) {
    activeConnections.set(sessionId, new Set());
  }
  activeConnections.get(sessionId).add(res);
  totalConnections++;

  console.log(
    `New connection: Session ${sessionId}, Total: ${totalConnections}, Unique: ${activeConnections.size}`
  );

  // Send initial count
  broadcastCount();

  // Heartbeat - send a comment every 15 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 15000);

  // Handle client disconnect
  req.on("close", () => {
    clearInterval(heartbeatInterval);

    const sessionConnections = activeConnections.get(sessionId);
    if (sessionConnections) {
      sessionConnections.delete(res);
      totalConnections--;

      // If this session has no more connections, remove it
      if (sessionConnections.size === 0) {
        activeConnections.delete(sessionId);
      }
    }

    console.log(
      `Connection closed: Session ${sessionId}, Total: ${totalConnections}, Unique: ${activeConnections.size}`
    );

    // Broadcast updated count to remaining clients
    broadcastCount();
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    totalConnections,
    uniqueVisitors: activeConnections.size,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/events`);
});
