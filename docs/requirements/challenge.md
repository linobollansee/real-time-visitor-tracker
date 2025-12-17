Coding Challenge: “real-time visitor tracker”
The Goal
Build a real-time visitor tracking application using Next.js for the frontend and ExpressJS for the backend. The app must display the total number of active users currently connected to the server.

The Core Requirements
The Persistent Stream:
The backend must expose a single SSE endpoint (e.g., /events).
The client must establish a connection to this endpoint using the EventSource API.
State Management:
The backend must keep track of the current number of active connections.
When a new tab opens (client connects), the count should increment.
When a tab closes (client disconnects), the count should decrement.
The Broadcast:
Every time the count changes (up or down), all connected clients must receive the updated number immediately.
The frontend should update the UI dynamically without a page refresh.
Technical Constraints
No WebSockets: You must use the SSE protocol.
No Database Required: You can manage the state in-memory on the server for this challenge.
Bonus Goals
If you finish early, try implementing these to see how SSE handles edge cases:

The “Heartbeat”: Implement a “keep-alive” comment or ping every 15 seconds to prevent the browser or proxies from closing the connection due to inactivity.
Connection Resilience: Ensure that if the server restarts, the client automatically attempts to reconnect (hint: check the default behavior of EventSource).
Unique Users: Instead of counting tabs, can you use a simple cookie or session ID to count “Unique Visitors” even if one person has three tabs open?
