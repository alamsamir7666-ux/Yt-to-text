"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { TranscriptSegment } from "@/types";

interface Props {
  transcript: string;
  videoTitle: string;
  segments?: TranscriptSegment[];
}

type Format = "txt" | "srt" | "pdf" | "docx";

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatSRT(segments: TranscriptSegment[]): string {
  return segments.map((seg, i) => {
    const start = secondsToSRT(seg.start);
    const end = secondsToSRT(seg.start + seg.duration);
    return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
  }).join("\n");
}

function secondsToSRT(secs: number): string {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  const ms = Math.round((secs % 1) * 1000).toString().padStart(3, "0");
  return `${h}:${m}:${s},${ms}`;
}

export default function ExportButtons({ transcript, videoTitle, segments }: Props) {
  const [loading, setLoading] = useState<Format | null>(null);

  const safe = videoTitle.replace(/[^a-z0-9]/gi, "_").slice(0, 50);

  const handleExport = async (format: Format) => {
    setLoading(format);
    try {
      if (format === "txt") {
        downloadBlob(transcript, `${safe}.txt`, "text/plain");
        toast.success("Downloaded TXT");
      } else if (format === "srt") {
        if (!segments?.length) { toast.error("No timestamps available"); return; }
        downloadBlob(formatSRT(segments), `${safe}.srt`, "text/plain");
        toast.success("Downloaded SRT");
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(videoTitle, 14, 20);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(transcript, 180);
        doc.text(lines, 14, 32);
        doc.save(`${safe}.pdf`);
        toast.success("Downloaded PDF");
      } else if (format === "docx") {
        const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import("docx");
        const doc = new Document({
          sections: [{
            children: [
              new Paragraph({ text: videoTitle, heading: HeadingLevel.HEADING_1 }),
              ...transcript.split("\n").map(line =>
                new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })
              ),
            ],
          }],
        });
        const buffer = await Packer.toBuffer(doc);
        downloadBlob(
          new TextDecoder().decode(buffer),
          `${safe}.docx`,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        toast.success("Downloaded DOCX");
      }
    } catch (err) {
      console.error(err);
      toast.error("Export failed — try again");
    } finally {
      setLoading(null);
    }
  };

  const formats: { key: Format; label: string }[] = [
    { key: "txt", label: "TXT" },
    { key: "srt", label: "SRT" },
    { key: "pdf", label: "PDF" },
    { key: "docx", label: "DOCX" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Download size={13} className="text-text-muted" />
      {formats.map(f => (
        <button
          key={f.key}
          onClick={() => handleExport(f.key)}
          disabled={loading === f.key}
          className="text-xs px-2.5 py-1.5 border border-border rounded-lg text-text-muted hover:text-white hover:border-accent/30 disabled:opacity-50 transition-all"
        >
          {loading === f.key ? "…" : f.label}
        </button>
      ))}
    </div>
  );
}
