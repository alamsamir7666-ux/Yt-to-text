"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import URLInput from "@/components/converter/URLInput";
import ProcessingAnimation from "@/components/converter/ProcessingAnimation";
import VideoInfo from "@/components/converter/VideoInfo";
import TranscriptOutput from "@/components/converter/TranscriptOutput";
import TimestampToggle from "@/components/converter/TimestampToggle";
import ExportButtons from "@/components/converter/ExportButtons";
import LanguageSelector from "@/components/converter/LanguageSelector";
import type { ConversionResult } from "@/types";

type AppState = "idle" | "processing" | "complete" | "error";

export default function ConverterPage() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [language, setLanguage] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");

  // Listen for history item loads from the sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent).detail;
      setResult(item);
      setState("complete");
      setSearchQuery("");
    };
    window.addEventListener("load-history", handler);
    return () => window.removeEventListener("load-history", handler);
  }, []);

  const handleConvert = async (url: string) => {
    setState("processing");
    setError(null);
    setResult(null);
    setSearchQuery("");

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language, includeTimestamps: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Conversion failed");
      }

      setResult(data);
      setState("complete");
      toast.success("Transcript ready!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
      toast.error(message);
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError(null);
    setSearchQuery("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero heading */}
      {state === "idle" && (
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Any video.<br />
            <span className="text-accent">Any language.</span> Instant text.
          </h1>
          <p className="text-text-muted text-base max-w-md mx-auto">
            Paste a YouTube URL — get a full, searchable transcript in seconds.
          </p>
        </div>
      )}

      {/* Language selector (idle only) */}
      {state === "idle" && (
        <div className="flex justify-end mb-3">
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      )}

      {/* URL Input */}
      <URLInput
        onConvert={handleConvert}
        isProcessing={state === "processing"}
        onReset={state !== "idle" ? handleReset : undefined}
      />

      {/* Processing animation */}
      {state === "processing" && (
        <div className="mt-10 animate-fade-in">
          <ProcessingAnimation />
        </div>
      )}

      {/* Error state */}
      {state === "error" && error && (
        <div className="mt-6 p-4 bg-error/10 border border-error/30 rounded-xl animate-fade-in">
          <p className="text-error text-sm font-medium">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-xs text-text-muted hover:text-white underline transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {state === "complete" && result && (
        <div className="mt-8 space-y-5 animate-fade-in">
          <VideoInfo video={result.video} wordCount={result.transcript.wordCount} />

          <div className="flex items-center justify-between">
            <TimestampToggle
              value={showTimestamps}
              onChange={setShowTimestamps}
              disabled={!result.transcript.hasTimestamps}
            />
            <ExportButtons
              transcript={result.transcript.fullText}
              videoTitle={result.video.title}
              segments={result.transcript.segments}
            />
          </div>

          <TranscriptOutput
            text={showTimestamps && result.transcript.segments
              ? result.transcript.segments.map(s => `[${formatTime(s.start)}] ${s.text}`).join("\n")
              : result.transcript.fullText
            }
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
