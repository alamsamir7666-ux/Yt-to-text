import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("kinde_id", user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ items: [], hasMore: false, total: 0 });
    }

    const { data: items, count } = await supabase
      .from("conversions")
      .select("*", { count: "exact" })
      .eq("user_id", dbUser.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const mapped = (items || []).map(item => ({
      id: item.id,
      videoUrl: item.video_url,
      videoTitle: item.video_title,
      videoThumbnail: item.video_thumbnail,
      videoDuration: item.video_duration,
      channelName: item.channel_name,
      transcript: item.transcript,
      transcriptWithTimestamps: item.transcript_with_timestamps,
      language: item.language,
      wordCount: item.word_count,
      status: item.status,
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      items: mapped,
      hasMore: (count || 0) > offset + limit,
      total: count || 0,
    });
  } catch (err) {
    console.error("History GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
