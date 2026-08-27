"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface FailedSync {
  id: string;
  event_type: string;
  error_message: string;
  retry_count: number;
  max_retries: number;
  status: "pending" | "retrying" | "failed" | "resolved";
  created_at: string;
  last_attempted_at: string;
  source_data: Record<string, any>;
}

export default function FailedSyncsPage() {
  const [items, setItems] = useState<FailedSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const fetchFailedSyncs = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/failed-syncs?status=${filter}`,
        { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.data || []);
    } catch (error) {
      console.error("Error fetching failed syncs:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFailedSyncs();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchFailedSyncs(), 30000);
    return () => clearInterval(interval);
  }, [fetchFailedSyncs]);

  async function handleRetry(id: string) {
    try {
      const res = await fetch(`/api/failed-syncs/${id}/retry`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        await fetchFailedSyncs();
      }
    } catch (error) {
      console.error("Error retrying sync:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/failed-syncs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        await fetchFailedSyncs();
      }
    } catch (error) {
      console.error("Error deleting sync:", error);
    }
  }

  const statusCounts = {
    pending: items.filter((i) => i.status === "pending").length,
    retrying: items.filter((i) => i.status === "retrying").length,
    failed: items.filter((i) => i.status === "failed").length,
  };

  return (
    <div className="p-8" style={{ animation: "fadeIn 0.6s ease-out" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .stat { animation: slideUp 0.6s ease-out; }
        .stat-value { font-variant-numeric: tabular-nums; }
        button { transition: all 150ms ease-out; }
        button:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        button:active { transform: scale(0.98); }
        .dlq-table tr { transition: background-color 150ms ease-out; }
        .dlq-table tr:hover { background-color: #f9fafb; }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dead Letter Queue</h1>
        <p className="text-gray-600 mb-8">Monitor and manage failed sync operations</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-gray-600 mt-2">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl font-bold text-blue-600">{statusCounts.retrying}</div>
            <div className="text-gray-600 mt-2">Retrying</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl font-bold text-red-600">{statusCounts.failed}</div>
            <div className="text-gray-600 mt-2">Failed</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "retrying", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items found</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Event Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Error</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Attempts</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Last Attempt</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{item.event_type}</td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      {item.error_message.substring(0, 50)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.retry_count} / {item.max_retries}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDistanceToNow(new Date(item.last_attempted_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      {item.status !== "failed" && (
                        <button
                          onClick={() => handleRetry(item.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
