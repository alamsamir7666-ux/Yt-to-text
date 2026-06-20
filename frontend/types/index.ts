export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  channelName: string;
  channelId?: string;
  viewCount?: number;
}

export interface TranscriptData {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
  hasTimestamps: boolean;
  wordCount: number;
}

export interface ConversionResult {
  video: VideoInfo;
  transcript: TranscriptData;
  method: "captions" | "ytdlp" | "whisper" | "history";
}

export interface HistoryItem {
  id: string;
  videoUrl: string;
  videoId?: string;
  videoTitle: string;
  videoThumbnail: string;
  videoDuration: number;
  channelName: string;
  transcript: string;
  transcriptWithTimestamps?: TranscriptSegment[];
  language: string;
  wordCount: number;
  status: string;
  createdAt: string;
}
