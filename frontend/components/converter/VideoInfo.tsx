"use client";

import Image from "next/image";
import type { VideoInfo as VideoInfoType } from "@/types";

interface Props {
  video: VideoInfoType;
  wordCount: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoInfo({ video, wordCount }: Props) {
  return (
    <div className="flex gap-4 p-4 bg-bg-surface border border-border rounded-xl">
      {video.thumbnail && (
        <div className="flex-shrink-0">
          <Image
            src={video.thumbnail}
            alt={video.title || "Video thumbnail"}
            width={120}
            height={68}
            className="rounded-lg object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="font-medium text-white text-sm leading-snug line-clamp-2">
          {video.title}
        </h2>
        <p className="text-text-muted text-xs mt-1">{video.channelName}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          {video.duration && (
            <span className="text-xs px-2 py-0.5 bg-bg-card rounded-md text-text-muted">
              ⏱ {formatDuration(video.duration)}
            </span>
          )}
          <span className="text-xs px-2 py-0.5 bg-bg-card rounded-md text-text-muted">
            📝 {wordCount.toLocaleString()} words
          </span>
        </div>
      </div>
    </div>
  );
}
