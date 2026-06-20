"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { HistoryItem } from "@/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = async (p = 1, append = false) => {
    try {
      const res = await fetch(`/api/history?page=${p}&limit=20`);
      const data = await res.json();
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setHasMore(data.hasMore);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHistory(next, true);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Conversion History</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted">No conversions yet.</p>
          <a href="/" className="text-accent text-sm hover:underline mt-2 inline-block">
            Convert your first video →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="group flex gap-4 p-4 bg-bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors"
            >
              {item.videoThumbnail && (
                <img
                  src={item.videoThumbnail}
                  alt=""
                  className="w-20 h-12 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{item.videoTitle || "Untitled"}</h3>
                <p className="text-xs text-text-muted mt-0.5">{item.channelName}</p>
                <p className="text-xs text-text-muted mt-1">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })} · {item.wordCount?.toLocaleString()} words
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-text-muted hover:text-white transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-text-muted hover:text-error transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-sm text-text-muted hover:text-white border border-border hover:border-accent/30 rounded-xl transition-colors"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
