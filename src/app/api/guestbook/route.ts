import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { hashPin } from "@/lib/hash";

// GET /api/guestbook — 최근 50개 (비밀번호 해시는 노출하지 않음)
export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("guestbook")
    .select("id,name,message,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data });
}

// POST /api/guestbook — 작성 (PIN은 해시로만 저장)
export async function POST(req: Request) {
  const { name, pin, message } = await req.json();
  if (!name || !pin || !message) {
    return NextResponse.json({ error: "필수 값이 누락되었습니다." }, { status: 400 });
  }
  const { error } = await getSupabaseAdmin().from("guestbook").insert({
    name,
    message,
    password_hash: hashPin(String(pin), name),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/guestbook — PIN 검증 후 삭제
export async function DELETE(req: Request) {
  const { id, pin } = await req.json();
  const { data, error } = await getSupabaseAdmin()
    .from("guestbook")
    .select("password_hash,name")
    .eq("id", id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });
  }
  if (data.password_hash !== hashPin(String(pin), data.name)) {
    return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }
  await getSupabaseAdmin().from("guestbook").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
