require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const transcriptRoutes = require("./routes/transcript");

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — restrict to Vercel domain in production
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "X-API-Key"],
}));

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));

// Rate limiting: 20 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Try again in 60 seconds.", code: "RATE_LIMIT", retry: true },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API key authentication middleware
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key", code: "UNAUTHORIZED" });
  }
  next();
});

// Routes
app.use("/api", transcriptRoutes);

// Health check (no auth needed — add before auth middleware for monitoring)
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR", retry: false });
});

app.listen(PORT, () => {
  console.log(`TranscriptAI backend running on port ${PORT}`);
});
