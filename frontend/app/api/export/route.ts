import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

function formatSRT(segments: Array<{ start: number; duration: number; text: string }>): string {
  return segments
    .map((seg, i) => {
      const start = secondsToSRTTime(seg.start);
      const end = secondsToSRTTime(seg.start + seg.duration);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
    })
    .join("\n");
}

function secondsToSRTTime(secs: number): string {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  const ms = Math.round((secs % 1) * 1000).toString().padStart(3, "0");
  return `${h}:${m}:${s},${ms}`;
}

export async function POST(req: NextRequest) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transcript, videoTitle, format, segments } = await req.json();

  if (format === "txt") {
    return new NextResponse(transcript, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${videoTitle}.txt"`,
      },
    });
  }

  if (format === "srt" && segments) {
    const srt = formatSRT(segments);
    return new NextResponse(srt, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${videoTitle}.srt"`,
      },
    });
  }

  // PDF and DOCX are generated client-side via jsPDF and docx packages
  return NextResponse.json({ error: "Use client-side export for PDF/DOCX" }, { status: 400 });
}
