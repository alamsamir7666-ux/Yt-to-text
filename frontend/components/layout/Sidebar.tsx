"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { X, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { HistoryItem } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(async (p = 1, append = false) => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    if (isOpen) fetchHistory(1);
  }, [isOpen, fetchHistory]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleLoad = (item: HistoryItem) => {
    window.dispatchEvent(new CustomEvent("load-history", {
      detail: {
        video: {
          id: item.videoId,
          title: item.videoTitle,
          thumbnail: item.videoThumbnail,
          duration: item.videoDuration,
          channelName: item.channelName,
        },
        transcript: {
          fullText: item.transcript,
          segments: item.transcriptWithTimestamps,
          language: item.language,
          hasTimestamps: !!item.transcriptWithTimestamps,
          wordCount: item.wordCount,
        },
        method: "history",
      },
    }));
    onClose();
  };

  const filtered = items.filter(
    i =>
      !search ||
      i.videoTitle?.toLowerCase().includes(search.toLowerCase()) ||
      i.channelName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-0 left-0 h-full w-80 bg-bg-surface border-r border-border z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display font-semibold text-white">History</h2>
            <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 bg-bg-card rounded-lg px-3 py-2">
              <Search size={14} className="text-text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder:text-text-muted outline-none flex-1 min-w-0"
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-text-muted text-sm">
                  {search ? "No results found" : "No conversions yet"}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filtered.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleLoad(item)}
                    className="group w-full flex gap-3 p-3 rounded-xl hover:bg-bg-card transition-colors text-left"
                  >
                    {item.videoThumbnail && (
                      <img
                        src={item.videoThumbnail}
                        alt=""
                        className="w-16 h-10 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate leading-tight">
                        {item.videoTitle || "Untitled"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{item.channelName}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={e => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-error transition-all flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                ))}

                {hasMore && (
                  <button
                    onClick={() => { const next = page + 1; setPage(next); fetchHistory(next, true); }}
                    className="w-full py-2 text-xs text-text-muted hover:text-white transition-colors"
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
