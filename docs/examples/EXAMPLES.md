# Examples

Practical examples and use cases for the Real-Time Visitor Tracker.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Multiple Connections](#multiple-connections)
- [Custom Integration](#custom-integration)
- [Advanced Use Cases](#advanced-use-cases)
- [API Integration](#api-integration)

---

## Basic Usage

### Example 1: Simple Connection

Open the application and observe the visitor counter.

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Browser: Open http://localhost:3000
```

**Expected Result:**

```
Connection Status: Connected
Total Connections: 1
Unique Visitors: 1
```

---

### Example 2: Testing with Browser DevTools

Monitor the SSE connection in real-time.

**Steps:**

1. Open `http://localhost:3000`
2. Press `F12` to open DevTools
3. Go to **Network** tab
4. Look for `events` request
5. Click on it and select **EventStream** tab

**What you'll see:**

```
data: {"totalConnections":1,"uniqueVisitors":1,"timestamp":"2025-12-17T10:30:45.123Z"}

: heartbeat

data: {"totalConnections":2,"uniqueVisitors":2,"timestamp":"2025-12-17T10:30:50.456Z"}
```

---

## Multiple Connections

### Example 3: Same User, Multiple Tabs

Test how the system tracks multiple tabs from the same user.

**Steps:**

1. Open `http://localhost:3000` in Tab 1
2. Note: Total Connections: 1, Unique Visitors: 1
3. Open `http://localhost:3000` in Tab 2
4. Observe both tabs update

**Tab 1 & Tab 2 show:**

```
Total Connections: 2
Unique Visitors: 1  (still just you!)
```

5. Close Tab 2
6. Tab 1 updates to:

```
Total Connections: 1
Unique Visitors: 1
```

---

### Example 4: Different Users

Test unique visitor tracking.

**Method 1: Incognito Windows**

```
1. Regular window → Unique Visitors: 1
2. Open incognito → Unique Visitors: 2
3. Open another incognito → Unique Visitors: 3
```

**Method 2: Different Browsers**

```
1. Open in Chrome → 1 visitor
2. Open in Firefox → 2 visitors
3. Open in Safari → 3 visitors
```

**Method 3: Different Devices**

```
1. Desktop → 1 visitor
2. Phone → 2 visitors
3. Tablet → 3 visitors
```

---

## Custom Integration

### Example 5: Integrate with Vanilla JavaScript

Use the tracker in a plain HTML page.

**File: `custom-page.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Visitor Tracker Integration</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .status {
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
      }
      .connected {
        background: #d4edda;
        color: #155724;
      }
      .disconnected {
        background: #f8d7da;
        color: #721c24;
      }
      .count {
        font-size: 48px;
        font-weight: bold;
        color: #007bff;
      }
    </style>
  </head>
  <body>
    <h1>Visitor Tracker</h1>

    <div id="status" class="status">Connecting...</div>

    <div>
      <h2>Total Connections</h2>
      <div id="total" class="count">0</div>
    </div>

    <div>
      <h2>Unique Visitors</h2>
      <div id="unique" class="count">0</div>
    </div>

    <div id="lastUpdate"></div>

    <script>
      const statusEl = document.getElementById("status");
      const totalEl = document.getElementById("total");
      const uniqueEl = document.getElementById("unique");
      const lastUpdateEl = document.getElementById("lastUpdate");

      // Create EventSource connection
      const eventSource = new EventSource("http://localhost:3001/events", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        statusEl.textContent = "Connected";
        statusEl.className = "status connected";
        console.log("SSE connection opened");
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        totalEl.textContent = data.totalConnections;
        uniqueEl.textContent = data.uniqueVisitors;

        const time = new Date(data.timestamp).toLocaleTimeString();
        lastUpdateEl.textContent = `Last updated: ${time}`;

        console.log("Received update:", data);
      };

      eventSource.onerror = (error) => {
        statusEl.textContent = "Reconnecting...";
        statusEl.className = "status disconnected";
        console.error("SSE error:", error);
      };

      // Cleanup on page unload
      window.addEventListener("beforeunload", () => {
        eventSource.close();
      });
    </script>
  </body>
</html>
```

**Usage:**

1. Save as `custom-page.html`
2. Make sure backend is running
3. Open file in browser

---

### Example 6: React Integration (Custom Component)

Create a reusable React hook for visitor tracking.

**File: `hooks/useVisitorTracker.ts`**

```typescript
import { useState, useEffect } from "react";

interface VisitorData {
  totalConnections: number;
  uniqueVisitors: number;
  timestamp: string;
}

interface ConnectionStatus {
  status: "connecting" | "connected" | "reconnecting" | "disconnected";
  data: VisitorData | null;
}

export function useVisitorTracker(apiUrl: string = "http://localhost:3001") {
  const [state, setState] = useState<ConnectionStatus>({
    status: "connecting",
    data: null,
  });

  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/events`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      setState((prev) => ({ ...prev, status: "connected" }));
    };

    eventSource.onmessage = (event) => {
      const data: VisitorData = JSON.parse(event.data);
      setState({ status: "connected", data });
    };

    eventSource.onerror = () => {
      setState((prev) => ({ ...prev, status: "reconnecting" }));
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);

  return state;
}
```

**Usage in Component:**

```typescript
import { useVisitorTracker } from "./hooks/useVisitorTracker";

export default function Dashboard() {
  const { status, data } = useVisitorTracker();

  return (
    <div>
      <h1>Visitor Dashboard</h1>
      <p>Status: {status}</p>
      {data && (
        <>
          <p>Total Connections: {data.totalConnections}</p>
          <p>Unique Visitors: {data.uniqueVisitors}</p>
        </>
      )}
    </div>
  );
}
```

---

### Example 7: Vue.js Integration

Use the tracker in a Vue 3 application.

**File: `VisitorTracker.vue`**

```vue
<template>
  <div class="visitor-tracker">
    <h2>Visitor Statistics</h2>

    <div :class="['status', connectionStatus]">
      {{ connectionStatus }}
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="label">Total Connections</div>
        <div class="value">{{ visitorData.totalConnections }}</div>
      </div>

      <div class="stat-card">
        <div class="label">Unique Visitors</div>
        <div class="value">{{ visitorData.uniqueVisitors }}</div>
      </div>
    </div>

    <div v-if="lastUpdate" class="timestamp">
      Last updated: {{ lastUpdate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface VisitorData {
  totalConnections: number;
  uniqueVisitors: number;
  timestamp: string;
}

const connectionStatus = ref<string>("connecting");
const visitorData = ref<VisitorData>({
  totalConnections: 0,
  uniqueVisitors: 0,
  timestamp: "",
});
const lastUpdate = ref<string>("");
let eventSource: EventSource | null = null;

onMounted(() => {
  eventSource = new EventSource("http://localhost:3001/events", {
    withCredentials: true,
  });

  eventSource.onopen = () => {
    connectionStatus.value = "connected";
  };

  eventSource.onmessage = (event) => {
    const data: VisitorData = JSON.parse(event.data);
    visitorData.value = data;
    lastUpdate.value = new Date(data.timestamp).toLocaleTimeString();
  };

  eventSource.onerror = () => {
    connectionStatus.value = "reconnecting";
  };
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
  }
});
</script>

<style scoped>
.visitor-tracker {
  padding: 20px;
}

.status {
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.status.connected {
  background: #d4edda;
  color: #155724;
}

.status.reconnecting {
  background: #fff3cd;
  color: #856404;
}

.stats {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.label {
  font-size: 14px;
  color: #6c757d;
}

.value {
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
}

.timestamp {
  font-size: 12px;
  color: #6c757d;
}
</style>
```

---

## Advanced Use Cases

### Example 8: Display Active Users in Header

Show visitor count in your website's header.

**File: `components/Header.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/events", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setActiveUsers(data.uniqueVisitors);
    };

    return () => eventSource.close();
  }, []);

  return (
    <header>
      <nav>
        <div>My Website</div>
        <div className="active-users">🔴 {activeUsers} online</div>
      </nav>
    </header>
  );
}
```

---

### Example 9: Notification on New Visitor

Show a toast notification when a new visitor joins.

```typescript
"use client";

import { useState, useEffect, useRef } from "react";

export default function VisitorNotifications() {
  const [visitors, setVisitors] = useState(0);
  const previousVisitors = useRef(0);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/events", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newCount = data.uniqueVisitors;

      // Check if visitors increased
      if (previousVisitors.current > 0 && newCount > previousVisitors.current) {
        showNotification("New visitor joined! 🎉");
      }

      previousVisitors.current = newCount;
      setVisitors(newCount);
    };

    return () => eventSource.close();
  }, []);

  function showNotification(message: string) {
    // Use your preferred notification library
    // or browser Notification API
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Visitor Alert", { body: message });
    }
  }

  return <div>Current visitors: {visitors}</div>;
}
```

---

### Example 10: Analytics Dashboard

Create a comprehensive dashboard with multiple metrics.

```typescript
"use client";

import { useState, useEffect } from "react";

interface Metrics {
  totalConnections: number;
  uniqueVisitors: number;
  peakConnections: number;
  averageConnections: number;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalConnections: 0,
    uniqueVisitors: 0,
    peakConnections: 0,
    averageConnections: 0,
  });

  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/events", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMetrics((prev) => {
        const newHistory = [...history, data.totalConnections].slice(-100);
        const average =
          newHistory.reduce((a, b) => a + b, 0) / newHistory.length;

        setHistory(newHistory);

        return {
          totalConnections: data.totalConnections,
          uniqueVisitors: data.uniqueVisitors,
          peakConnections: Math.max(
            prev.peakConnections,
            data.totalConnections
          ),
          averageConnections: Math.round(average),
        };
      });
    };

    return () => eventSource.close();
  }, [history]);

  return (
    <div className="dashboard">
      <h1>Analytics Dashboard</h1>

      <div className="metrics-grid">
        <MetricCard
          title="Current Connections"
          value={metrics.totalConnections}
          color="blue"
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors}
          color="purple"
        />
        <MetricCard
          title="Peak Connections"
          value={metrics.peakConnections}
          color="green"
        />
        <MetricCard
          title="Average Connections"
          value={metrics.averageConnections}
          color="orange"
        />
      </div>

      <div className="history">{/* Add chart visualization here */}</div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`metric-card ${color}`}>
      <div className="title">{title}</div>
      <div className="value">{value}</div>
    </div>
  );
}
```

---

## API Integration

### Example 11: Fetch Current Status (Without SSE)

Get visitor count without maintaining a persistent connection.

```typescript
async function getCurrentVisitorCount(): Promise<{
  totalConnections: number;
  uniqueVisitors: number;
}> {
  const response = await fetch("http://localhost:3001/health");
  const data = await response.json();

  return {
    totalConnections: data.totalConnections,
    uniqueVisitors: data.uniqueVisitors,
  };
}

// Usage
getCurrentVisitorCount().then((data) => {
  console.log("Total connections:", data.totalConnections);
  console.log("Unique visitors:", data.uniqueVisitors);
});
```

---

### Example 12: Python Client

Monitor visitor count from Python.

```python
import requests
import sseclient

def stream_visitor_count():
    """Stream real-time visitor updates."""
    response = requests.get(
        'http://localhost:3001/events',
        stream=True,
        headers={'Accept': 'text/event-stream'}
    )

    client = sseclient.SSEClient(response)

    for event in client.events():
        if event.data:
            import json
            data = json.loads(event.data)
            print(f"Total: {data['totalConnections']}, "
                  f"Unique: {data['uniqueVisitors']}")

def get_current_status():
    """Get current visitor count (single request)."""
    response = requests.get('http://localhost:3001/health')
    data = response.json()
    return data

# Example usage
if __name__ == '__main__':
    # Option 1: Stream updates
    stream_visitor_count()

    # Option 2: Single check
    status = get_current_status()
    print(f"Status: {status}")
```

---

### Example 13: Node.js Client

Monitor from another Node.js application.

```javascript
const EventSource = require("eventsource");

const eventSource = new EventSource("http://localhost:3001/events");

eventSource.onopen = () => {
  console.log("Connected to visitor tracker");
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(
    `Connections: ${data.totalConnections}, Visitors: ${data.uniqueVisitors}`
  );

  // Do something with the data
  if (data.uniqueVisitors > 100) {
    console.log("🎉 Over 100 visitors!");
  }
};

eventSource.onerror = (error) => {
  console.error("Connection error:", error);
};

// Cleanup
process.on("SIGINT", () => {
  eventSource.close();
  process.exit();
});
```

---

## Next Steps

- Read the [API Documentation](../api/API.md)
- Check [Architecture Details](../architecture/ARCHITECTURE.md)
- Review [Troubleshooting Guide](../TROUBLESHOOTING.md)
- See [Contributing Guidelines](../CONTRIBUTING.md)
