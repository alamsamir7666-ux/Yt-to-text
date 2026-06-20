const express = require("express");
const router = express.Router();
const { getTranscript } = require("../services/youtube");

// Simple in-memory cache (1 hour TTL)
const cache = new Map();

function getCached(videoId) {
  const entry = cache.get(videoId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(videoId);
    return null;
  }
  return entry.data;
}

function setCache(videoId, data) {
  cache.set(videoId, {
    data,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  });
}

// POST /api/transcript
router.post("/transcript", async (req, res) => {
  try {
    const { url, language = "en", includeTimestamps = true } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required", code: "MISSING_URL" });
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        error: "Invalid YouTube URL. Try: youtube.com/watch?v=... or youtu.be/...",
        code: "INVALID_URL",
      });
    }

    // Check cache
    const cacheKey = `${videoId}:${language}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${videoId}`);
      return res.json(cached);
    }

    // Get transcript via 3-tier pipeline
    const result = await getTranscript(videoId, { language, includeTimestamps });

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error("Transcript error:", err);

    const status = {
      PRIVATE_VIDEO: 403,
      VIDEO_NOT_FOUND: 404,
      NO_CAPTIONS: 422,
      RATE_LIMIT: 429,
      WHISPER_FAILED: 500,
    }[err.code] || 500;

    res.status(status).json({
      error: err.message || "Failed to get transcript",
      code: err.code || "UNKNOWN_ERROR",
      retry: status >= 500,
    });
  }
});

function extractVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

module.exports = router;
