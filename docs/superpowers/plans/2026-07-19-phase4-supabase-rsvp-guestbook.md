# Phase 4: Supabase RSVP + Guestbook Implementation Plan

> 인라인 실행. DB 접근은 전부 Next.js API Route(서버)에서 service_role 키로 수행 → 브라우저에 비밀키 노출 없음.

**Goal:** 참석 의사(RSVP)와 방명록(Guestbook)을 Supabase에 저장/조회/삭제한다.

**Architecture:** 브라우저는 Supabase에 직접 접근하지 않는다. 클라이언트 폼 → `fetch('/api/...')` → **API Route(서버)** → Supabase(service_role, RLS 우회). 방명록 삭제는 서버에서 비밀번호 해시 검증 후 수행.

**Tech Stack:** Next.js Route Handler(`app/api/**/route.ts`), @supabase/supabase-js, Node `crypto`(비밀번호 해시).

## Global Constraints
- 비밀키(`SUPABASE_SERVICE_ROLE_KEY`)는 서버 전용 env, 절대 `NEXT_PUBLIC_` 아님, `.env.local`(gitignore됨).
- RLS 켜고 공개 정책 없음 → 오직 서버(service_role)만 접근.
- 무료 티어. props 주입 유지.

---

## 사용자 준비 (블로킹)
1. Supabase 프로젝트 생성(또는 기존 사용).
2. SQL Editor에서 아래 실행:
```sql
create table if not exists public.rsvp (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  side text not null check (side in ('신랑측','신부측')),
  name text not null,
  attend boolean not null,
  guest_count int not null default 1,
  meal boolean not null default true,
  phone text,
  message text
);
create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  password_hash text not null,
  message text not null
);
alter table public.rsvp enable row level security;
alter table public.guestbook enable row level security;
```
3. 프로젝트 루트에 `.env.local` 생성:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...(anon public)
SUPABASE_SERVICE_ROLE_KEY=eyJ...(service_role secret)
```
4. dev 서버 재시작(`.env.local`은 재시작해야 반영).

---

## 파일 구조 (Phase 4)
```
src/
├── lib/supabase-server.ts     # service_role 서버 클라이언트
├── lib/hash.ts                # 비밀번호 해시(sha256)
├── types.ts                   # RsvpInput, GuestbookEntry, GuestbookInput
├── config.ts                  # rsvp.enabled, guestbook.enabled (선택 노출)
├── app/api/rsvp/route.ts       # POST
├── app/api/guestbook/route.ts  # GET, POST, DELETE
└── components/
    ├── RSVP.tsx                # 폼 (client)
    └── Guestbook.tsx           # 목록+작성+삭제 (client)
```

---

### Task 11: 의존성 + 서버 클라이언트 + 해시 유틸

- [ ] **Step 1:** `npm install @supabase/supabase-js`
- [ ] **Step 2:** `src/lib/supabase-server.ts`
```ts
import { createClient } from "@supabase/supabase-js";

// 서버 전용. service_role 키로 RLS 우회. 브라우저 번들에 포함 금지(=API Route에서만 import).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```
- [ ] **Step 3:** `src/lib/hash.ts`
```ts
import { createHash } from "crypto";
// 방명록 4자리 PIN 해시(경량 목적). 솔트는 프로젝트 고정 + 이름.
export function hashPin(pin: string, name: string): string {
  return createHash("sha256").update(`${name}:${pin}:wedding-salt`).digest("hex");
}
```
- [ ] **Step 4:** `npx tsc --noEmit` (env 없어도 타입은 통과) → Commit `chore: supabase 서버 클라이언트+해시 유틸`

---

### Task 12: RSVP API + 폼

**types.ts 추가:**
```ts
export type RsvpInput = {
  side: "신랑측" | "신부측";
  name: string;
  attend: boolean;
  guestCount: number;
  meal: boolean;
  phone?: string;
  message?: string;
};
```

- [ ] **Step 1:** `src/app/api/rsvp/route.ts`
```ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { RsvpInput } from "@/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<RsvpInput>;
  if (!body.name || !body.side || typeof body.attend !== "boolean") {
    return NextResponse.json({ error: "필수 값 누락" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("rsvp").insert({
    side: body.side,
    name: body.name,
    attend: body.attend,
    guest_count: body.guestCount ?? 1,
    meal: body.meal ?? true,
    phone: body.phone ?? null,
    message: body.message ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```
- [ ] **Step 2:** `src/components/RSVP.tsx` (client 폼: side/name/attend/guestCount/meal/phone/message → POST, 성공 메시지)
- [ ] **Step 3:** page.tsx에 `<RSVP />` 추가(Our Story 아래)
- [ ] **Step 4:** 검증(키 설정 후): 폼 제출 → Supabase `rsvp` 테이블에 행 생성 확인. → Commit `feat: RSVP 폼+API`

---

### Task 13: Guestbook API + 컴포넌트

**types.ts 추가:**
```ts
export type GuestbookEntry = { id: number; name: string; message: string; created_at: string };
export type GuestbookInput = { name: string; pin: string; message: string };
```

- [ ] **Step 1:** `src/app/api/guestbook/route.ts` — GET(최근 50), POST(해시 저장), DELETE(핀 검증 후 삭제)
```ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { hashPin } from "@/lib/hash";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("guestbook")
    .select("id,name,message,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data });
}

export async function POST(req: Request) {
  const { name, pin, message } = await req.json();
  if (!name || !pin || !message) return NextResponse.json({ error: "필수 값 누락" }, { status: 400 });
  const { error } = await supabaseAdmin.from("guestbook").insert({
    name, message, password_hash: hashPin(String(pin), name),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id, name, pin } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("guestbook").select("password_hash,name").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "없음" }, { status: 404 });
  if (data.password_hash !== hashPin(String(pin), data.name))
    return NextResponse.json({ error: "비밀번호 불일치" }, { status: 403 });
  await supabaseAdmin.from("guestbook").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
```
- [ ] **Step 2:** `src/components/Guestbook.tsx` (client: 마운트 시 GET, 작성 폼 name/pin/message → POST 후 갱신, 각 항목 삭제 → pin 입력 → DELETE)
- [ ] **Step 3:** page.tsx에 `<Guestbook />` 추가(RSVP 아래)
- [ ] **Step 4:** 검증(키 설정 후): 작성→목록 표시, 삭제(핀)→사라짐. 빌드 성공. → Commit & Push `feat: Guestbook 폼+API`

---

## Self-Review
- Spec coverage: RSVP(§6-8, 데이터모델 §5), Guestbook(§6, §5) 태스크 존재.
- 보안: 비밀키 서버 전용, RLS 공개정책 없음, 방명록 비번 해시.
- Type 일관성: `RsvpInput`, `GuestbookEntry/Input` 정의 ↔ API/컴포넌트 사용 일치.
