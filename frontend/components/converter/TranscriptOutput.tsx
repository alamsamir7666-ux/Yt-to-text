"use client";

import { useMemo, useRef } from "react";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";

interface Props {
  text: string;
  searchQuery: string;
  onSearch: (q: string) => void;
}

function highlight(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function TranscriptOutput({ text, searchQuery, onSearch }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const highlightedHtml = useMemo(
    () => highlight(text, searchQuery).replace(/\n/g, "<br />"),
    [text, searchQuery]
  );

  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return (text.match(regex) || []).length;
  }, [text, searchQuery]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="flex-1 flex items-center gap-2 bg-bg-card rounded-lg px-3 py-1.5">
          <Search size={13} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder:text-text-muted outline-none flex-1"
          />
          {searchQuery && (
            <span className="text-xs text-text-muted whitespace-nowrap">
              {matchCount} match{matchCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted hover:text-white border border-border rounded-lg hover:border-accent/30 transition-all"
        >
          <Copy size={12} />
          Copy
        </button>
      </div>

      {/* Transcript content */}
      <div
        ref={containerRef}
        className="h-[500px] overflow-y-auto p-4 font-mono text-xs leading-relaxed text-text-primary"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
