"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [visitorCount, setVisitorCount] = useState({
    totalConnections: 0,
    uniqueVisitors: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      setConnectionStatus("Connecting...");

      // Create EventSource connection with credentials to send cookies
      eventSource = new EventSource("http://localhost:3001/events", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        setConnectionStatus("Connected");
        console.log("SSE connection established");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setVisitorCount({
            totalConnections: data.totalConnections,
            uniqueVisitors: data.uniqueVisitors,
          });
          setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        setConnectionStatus("Reconnecting...");
        // EventSource automatically attempts to reconnect
      };
    };

    connectToSSE();

    // Cleanup on component unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Real-Time Visitor Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            Track active visitors in real-time using Server-Sent Events (SSE)
          </p>

          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "Connected"
                    ? "bg-green-500 animate-pulse"
                    : "bg-yellow-500"
                }`}
              />
              <span className="text-sm text-gray-600">{connectionStatus}</span>
            </div>

            {/* Visitor Count Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Connections */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform transition hover:scale-105">
                <div className="text-sm font-medium mb-2 opacity-90">
                  Total Connections
                </div>
                <div className="text-5xl font-bold mb-2">
                  {visitorCount.totalConnections}
                </div>
                <div className="text-xs opacity-75">Active browser tabs</div>
              </div>

              {/* Unique Visitors */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg transform transition hover:scale-105">
                <div className="text-sm font-medium mb-2 opacity-90">
                  Unique Visitors
                </div>
                <div className="text-5xl font-bold mb-2">
                  {visitorCount.uniqueVisitors}
                </div>
                <div className="text-xs opacity-75">Individual users</div>
              </div>
            </div>

            {/* Last Update */}
            {lastUpdate && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
              <h2 className="font-semibold text-gray-800 mb-2">
                How it works:
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Open multiple tabs to see the count increase</li>
                <li>Close tabs to see the count decrease</li>
                <li>Unique visitors are tracked using cookies</li>
                <li>Updates happen in real-time via SSE</li>
                <li>Connection automatically reconnects if interrupted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
