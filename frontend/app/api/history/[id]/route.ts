import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: dbUser } = await supabase
      .from("users")
      .select("id")
      .eq("kinde_id", user.id)
      .single();

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { error } = await supabase
      .from("conversions")
      .delete()
      .eq("id", params.id)
      .eq("user_id", dbUser.id); // security: only own records

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("History DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
