import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트(service_role, RLS 우회).
// 지연 생성 — 빌드 시 모듈 로드만으로 키를 요구하지 않도록 요청 시점에 만든다.
// 반드시 API Route(서버)에서만 사용 — 브라우저 번들 금지.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase 환경변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 설정하세요."
      );
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
