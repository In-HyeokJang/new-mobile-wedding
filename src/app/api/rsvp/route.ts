import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { RsvpInput } from "@/types";

// POST /api/rsvp — 참석 의사 저장
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<RsvpInput>;

  // 서버측 최소 검증 (클라이언트 검증은 신뢰하지 않는다)
  if (!body.name || !body.side || typeof body.attend !== "boolean") {
    return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from("rsvp").insert({
    side: body.side,
    name: body.name,
    attend: body.attend,
    guest_count: body.guestCount ?? 1,
    meal: body.meal ?? true,
    phone: body.phone ?? null,
    message: body.message ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
