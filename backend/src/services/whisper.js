const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const tmp = require("tmp");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

let openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      const e = new Error("OPENAI_API_KEY is not configured");
      e.code = "WHISPER_FAILED";
      throw e;
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function transcribeAudio(videoId, language = "en") {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const audioPath = path.join(tmpDir.name, "audio.mp3");

  try {
    console.log(`[Whisper] Downloading audio for ${videoId}...`);
    await downloadAudio(url, audioPath);

    console.log(`[Whisper] Transcribing...`);
    const audioFile = fs.createReadStream(audioPath);

    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: language === "zh-Hans" ? "zh" : language,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const segments = (transcription.segments || []).map(s => ({
      start: s.start,
      duration: s.end - s.start,
      text: s.text.trim(),
    }));

    const fullText = segments.map(s => s.text).join(" ").trim();

    return {
      segments,
      fullText,
      language,
      hasTimestamps: segments.length > 0,
      wordCount: fullText.trim().split(/\s+/).filter(Boolean).length,
    };
  } catch (err) {
    const e = new Error(err.message || "Whisper transcription failed");
    e.code = "WHISPER_FAILED";
    throw e;
  } finally {
    tmpDir.removeCallback();
  }
}

function downloadAudio(url, outputPath) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, {
      quality: "lowestaudio",
      filter: "audioonly",
    });

    ffmpeg(stream)
      .audioCodec("libmp3lame")
      .audioFrequency(16000)
      .audioChannels(1)
      .audioBitrate(64)
      .format("mp3")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

module.exports = { transcribeAudio };
