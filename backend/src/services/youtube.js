const { getSubtitles } = require("youtube-captions-scraper");
const he = require("he");
const { transcribeAudio } = require("./whisper");

/**
 * 3-tier transcript pipeline:
 * 1. YouTube Captions Scraper (free, ~0.5s)
 * 2. yt-dlp subtitles (free, ~2-5s)
 * 3. OpenAI Whisper (paid, ~10-30s)
 */
async function getTranscript(videoId, options = {}) {
  const { language = "en", includeTimestamps = true } = options;

  // Fetch video metadata in parallel with transcript
  const [videoInfo, transcript] = await Promise.all([
    getVideoInfo(videoId),
    getTranscriptText(videoId, language, includeTimestamps),
  ]);

  return {
    video: videoInfo,
    transcript,
    method: transcript.method,
  };
}

async function getTranscriptText(videoId, language, includeTimestamps) {
  // Tier 1: YouTube Captions Scraper
  try {
    console.log(`[Tier 1] Trying captions scraper for ${videoId}`);
    const captions = await getSubtitles({ videoID: videoId, lang: language });

    if (captions && captions.length > 0) {
      const segments = captions.map(c => ({
        start: parseFloat(c.start),
        duration: parseFloat(c.dur),
        text: he.decode(c.text.replace(/\n/g, " ").trim()),
      }));

      const fullText = buildFullText(segments);
      console.log(`[Tier 1] Success: ${segments.length} segments`);

      return {
        segments,
        fullText,
        language,
        hasTimestamps: true,
        wordCount: countWords(fullText),
        method: "captions",
      };
    }
  } catch (err) {
    console.log(`[Tier 1] Failed: ${err.message}`);
  }

  // Tier 2: yt-dlp (requires yt-dlp installed on server)
  try {
    console.log(`[Tier 2] Trying yt-dlp for ${videoId}`);
    const ytdlpResult = await getYtDlpSubtitles(videoId, language);
    if (ytdlpResult) {
      console.log(`[Tier 2] Success`);
      return { ...ytdlpResult, method: "ytdlp" };
    }
  } catch (err) {
    console.log(`[Tier 2] Failed: ${err.message}`);
  }

  // Tier 3: OpenAI Whisper
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log(`[Tier 3] Trying Whisper for ${videoId}`);
      const whisperResult = await transcribeAudio(videoId, language);
      console.log(`[Tier 3] Success`);
      return { ...whisperResult, method: "whisper" };
    } catch (err) {
      console.log(`[Tier 3] Failed: ${err.message}`);
      const e = new Error("No transcript available for this video");
      e.code = "WHISPER_FAILED";
      throw e;
    }
  }

  const e = new Error("No transcript available for this video");
  e.code = "NO_CAPTIONS";
  throw e;
}

async function getYtDlpSubtitles(videoId, language) {
  const { exec } = require("child_process");
  const { promisify } = require("util");
  const execAsync = promisify(exec);
  const tmp = require("tmp");
  const fs = require("fs");
  const path = require("path");

  const tmpDir = tmp.dirSync({ unsafeCleanup: true });

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    await execAsync(
      `yt-dlp --write-sub --write-auto-sub --sub-lang ${language} --skip-download --output "${tmpDir.name}/%(id)s" "${url}"`,
      { timeout: 30000 }
    );

    const files = fs.readdirSync(tmpDir.name);
    const vttFile = files.find(f => f.endsWith(".vtt"));
    if (!vttFile) return null;

    const vttContent = fs.readFileSync(path.join(tmpDir.name, vttFile), "utf-8");
    return parseVTT(vttContent, language);
  } finally {
    tmpDir.removeCallback();
  }
}

function parseVTT(vttContent, language) {
  const lines = vttContent.split("\n");
  const segments = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.includes("-->")) {
      const [startStr, endStr] = line.split("-->").map(s => s.trim());
      const start = vttTimeToSeconds(startStr);
      const end = vttTimeToSeconds(endStr);
      const textLines = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        const clean = lines[i].trim().replace(/<[^>]+>/g, "");
        if (clean) textLines.push(he.decode(clean));
        i++;
      }
      if (textLines.length > 0) {
        segments.push({ start, duration: end - start, text: textLines.join(" ") });
      }
    }
    i++;
  }

  const fullText = buildFullText(segments);
  return { segments, fullText, language, hasTimestamps: true, wordCount: countWords(fullText) };
}

function vttTimeToSeconds(timeStr) {
  const parts = timeStr.replace(",", ".").split(":");
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
}

async function getVideoInfo(videoId) {
  // Try YouTube Data API if key is available
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`
      );
      const data = await res.json();
      const item = data.items?.[0];

      if (item) {
        return {
          id: videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.maxres?.url ||
                     item.snippet.thumbnails?.high?.url ||
                     `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: parseDuration(item.contentDetails.duration),
          channelName: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          viewCount: parseInt(item.statistics?.viewCount || "0"),
        };
      }
    } catch (err) {
      console.log("YouTube API failed, using fallback info:", err.message);
    }
  }

  // Fallback: basic info from thumbnail URL
  return {
    id: videoId,
    title: `Video ${videoId}`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: 0,
    channelName: "Unknown",
  };
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || 0) * 3600) +
         (parseInt(match[2] || 0) * 60) +
         parseInt(match[3] || 0);
}

function buildFullText(segments) {
  let text = "";
  let lastEnd = 0;

  for (const seg of segments) {
    // Add paragraph break if gap > 3 seconds
    if (seg.start - lastEnd > 3 && text) text += "\n\n";
    else if (text) text += " ";
    text += seg.text;
    lastEnd = seg.start + seg.duration;
  }

  return text.trim();
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

module.exports = { getTranscript };
