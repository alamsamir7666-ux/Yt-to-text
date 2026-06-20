import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    const body = await req.json();
    const { url, language = "en", includeTimestamps = true } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Proxy to Render backend
    const backendRes = await fetch(`${process.env.RENDER_API_URL}/api/transcript`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.RENDER_API_KEY!,
      },
      body: JSON.stringify({ url, language, includeTimestamps }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || "Conversion failed", code: data.code },
        { status: backendRes.status }
      );
    }

    // Upsert user to Supabase
    await supabase.from("users").upsert(
      { kinde_id: user.id, email: user.email, name: user.given_name },
      { onConflict: "kinde_id" }
    );

    // Get internal user ID
    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("kinde_id", user.id)
      .single();

    // Save conversion to history (non-fatal if fails)
    if (dbUser) {
      await supabase.from("conversions").insert({
        user_id: dbUser.id,
        video_url: url,
        video_id: data.video.id,
        video_title: data.video.title,
        video_thumbnail: data.video.thumbnail,
        video_duration: data.video.duration,
        channel_name: data.video.channelName,
        transcript: data.transcript.fullText,
        transcript_with_timestamps: data.transcript.segments,
        language: data.transcript.language,
        word_count: data.transcript.wordCount,
        char_count: data.transcript.fullText.length,
        method: data.method,
        status: "completed",
      }).catch(console.error);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Convert error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
