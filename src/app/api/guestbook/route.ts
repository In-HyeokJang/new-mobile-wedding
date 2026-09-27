import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { hashPin } from "@/lib/hash";

const PAGE_SIZE = 5;
const NAME_MAX = 20;
const MESSAGE_MAX = 500;
const PIN_PATTERN = /^\d{4}$/;

// ── 요청 횟수 제한 ─────────────────────────────────────────────
// 서버 인스턴스 메모리에 IP별 횟수를 센다. 인스턴스가 여러 개거나 재시작되면
// 초기화되므로 완벽한 차단은 아니지만, 스크립트 한 줄로 하는 도배와
// 삭제 비밀번호(4자리) 무차별 대입을 사실상 못 하게 만든다.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // 오래된 항목 정리 (메모리 무한 증가 방지)
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
    }
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

// Response 는 한 번만 읽을 수 있어 요청마다 새로 만든다
function tooMany() {
  return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
}

// DB/설정 오류 원문은 로그에만 남기고 하객에게는 일반 문구만 보여준다
function serverError(where: string, err: unknown) {
  console.error(`[guestbook] ${where}`, err);
  return NextResponse.json(
    { error: "일시적인 오류입니다. 잠시 후 다시 시도해 주세요." },
    { status: 500 }
  );
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

// GET /api/guestbook?page=1 — 최신순 한 페이지 + 전체 개수 (비밀번호 해시는 노출하지 않음)
export async function GET(req: Request) {
  const pageParam = Number(new URL(req.url).searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const from = (page - 1) * PAGE_SIZE;

  try {
    const { data, error, count } = await getSupabaseAdmin()
      .from("guestbook")
      .select("id,name,message,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return serverError("GET", error);
    return NextResponse.json({ entries: data, total: count ?? 0, pageSize: PAGE_SIZE });
  } catch (e) {
    return serverError("GET", e);
  }
}

// POST /api/guestbook — 작성 (PIN은 해시로만 저장)
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  // 봇 차단용 숨은 입력칸. 사람은 볼 수 없어서 비어 있어야 정상이다.
  // 성공처럼 응답해서 봇이 차단 여부를 눈치채지 못하게 한다.
  if (typeof body.website === "string" && body.website !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const pin = typeof body.pin === "string" ? body.pin : "";

  if (!name || !message || !pin) {
    return NextResponse.json({ error: "이름·비밀번호·메시지를 모두 입력해 주세요." }, { status: 400 });
  }
  if (name.length > NAME_MAX) {
    return NextResponse.json({ error: `이름은 ${NAME_MAX}자까지 입력할 수 있어요.` }, { status: 400 });
  }
  if (message.length > MESSAGE_MAX) {
    return NextResponse.json({ error: `메시지는 ${MESSAGE_MAX}자까지 입력할 수 있어요.` }, { status: 400 });
  }
  if (!PIN_PATTERN.test(pin)) {
    return NextResponse.json({ error: "비밀번호는 숫자 4자리로 입력해 주세요." }, { status: 400 });
  }

  // IP당 10분에 5개
  if (!hit(`post:${clientIp(req)}`, 5, 10 * 60_000)) return tooMany();

  try {
    const { error } = await getSupabaseAdmin().from("guestbook").insert({
      name,
      message,
      password_hash: hashPin(pin, name),
    });
    if (error) return serverError("POST", error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError("POST", e);
  }
}

// DELETE /api/guestbook — PIN 검증 후 삭제
export async function DELETE(req: Request) {
  const body = await readJson(req);
  const id = body?.id;
  const pin = body?.pin;
  // 예전 글은 4자리 제한 전에 쓰였을 수 있어 형식은 느슨하게 본다
  if (!Number.isInteger(id) || typeof pin !== "string" || !pin || pin.length > 50) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 틀린 비밀번호 시도: IP당 10분에 10회, 글 하나당 10분에 5회.
  // 4자리(1만 가지)를 하나씩 대입해 남의 글을 지우는 걸 막는다.
  const ip = clientIp(req);
  const ipKey = `del:${ip}`;
  const idKey = `del-id:${id}`;
  const blocked = (key: string, limit: number) => {
    const b = buckets.get(key);
    return !!b && b.resetAt > Date.now() && b.count >= limit;
  };
  if (blocked(ipKey, 10) || blocked(idKey, 5)) return tooMany();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("guestbook")
      .select("password_hash,name")
      .eq("id", id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });
    }
    if (data.password_hash !== hashPin(pin, data.name)) {
      hit(ipKey, 10, 10 * 60_000);
      hit(idKey, 5, 10 * 60_000);
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
    }
    const { error: delError } = await supabase.from("guestbook").delete().eq("id", id);
    if (delError) return serverError("DELETE", delError);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError("DELETE", e);
  }
}
