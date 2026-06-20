"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, ClipboardPaste } from "lucide-react";

const YT_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
const RAW_ID = /^[a-zA-Z0-9_-]{11}$/;

function isValidYouTubeUrl(url: string): boolean {
  return YT_REGEX.test(url) || RAW_ID.test(url.trim());
}

interface Props {
  onConvert: (url: string) => void;
  isProcessing: boolean;
  onReset?: () => void;
}

export default function URLInput({ onConvert, isProcessing, onReset }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setError("Invalid YouTube URL. Try: youtube.com/watch?v=... or youtu.be/...");
      return;
    }
    setError(null);
    onConvert(trimmed);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) handleSubmit();
  };

  const handleReset = () => {
    setUrl("");
    setError(null);
    onReset?.();
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        {/* Input */}
        <div className="flex-1 flex items-center gap-2 bg-bg-surface border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 transition-colors">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={e => { setUrl(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder="Paste a YouTube URL..."
            disabled={isProcessing}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-text-muted outline-none min-w-0"
          />
          {url && (
            <button
              onClick={() => { setUrl(""); setError(null); inputRef.current?.focus(); }}
              className="text-text-muted hover:text-white transition-colors text-xs px-1"
            >
              ✕
            </button>
          )}
          {!url && (
            <button
              onClick={handlePaste}
              className="text-text-muted hover:text-white transition-colors"
              title="Paste from clipboard"
            >
              <ClipboardPaste size={15} />
            </button>
          )}
        </div>

        {/* Convert / Reset button */}
        {onReset ? (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 bg-bg-surface border border-border text-text-muted rounded-xl hover:text-white hover:border-accent/30 transition-all text-sm"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:inline">New</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !url}
            className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <span className="text-xs">Processing…</span>
            ) : (
              <>
                Convert
                <ArrowRight size={15} />
              </>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
