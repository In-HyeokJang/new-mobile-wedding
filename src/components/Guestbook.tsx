"use client";

import { useCallback, useEffect, useState } from "react";
import Section from "./Section";
import type { GuestbookEntry } from "@/types";

// 서버(api/guestbook)와 같은 제한값. 서버가 최종 검증하고, 여기선 입력 단계에서 미리 막는다
const NAME_MAX = 20;
const MESSAGE_MAX = 500;
const PAGE_WINDOW = 5;

// "12.13" 형식 (한국시간)
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(iso))
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // 봇 차단용 숨은 칸 (사람은 비워 둔다)
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  // 목록은 서버에서 한 페이지씩 받는다 — 전부 받아 나누면 글이 많아질 때 느리고,
  // 예전처럼 "최신 50개"로 자르면 오래된 글이 사라진다.
  const load = useCallback(async (p: number) => {
    try {
      const res = await fetch(`/api/guestbook?page=${p}`);
      const json = await res.json();
      if (res.ok) {
        setEntries(json.entries ?? []);
        setTotal(json.total ?? 0);
        setPageSize(json.pageSize ?? 5);
      }
    } catch {
      /* 목록 로드 실패는 조용히 무시 */
    }
  }, []);

  useEffect(() => {
    // 페이지가 바뀔 때마다 방명록 목록 fetch(외부 데이터 동기화) — 의도된 패턴.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(page);
  }, [load, page]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    if (!name.trim() || !pin || !message.trim()) {
      setErr("이름·비밀번호·메시지를 모두 입력해 주세요.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setErr("비밀번호는 숫자 4자리로 입력해 주세요.");
      return;
    }
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin, message, website }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "작성 실패");
      setMessage("");
      setPin("");
      setDone(true);
      // 새 글은 최신순 1페이지에 보인다
      if (page === 1) await load(1);
      else setPage(1);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "작성에 실패했습니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function remove(id: number) {
    const inputPin = window.prompt("작성할 때 입력한 비밀번호 4자리를 입력해 주세요.");
    if (!inputPin) return;
    const res = await fetch("/api/guestbook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pin: inputPin }),
    });
    if (res.ok) {
      // 마지막 페이지의 마지막 글을 지우면 빈 페이지가 되므로 한 페이지 앞으로
      const lastPage = Math.max(1, Math.ceil((total - 1) / pageSize));
      if (page > lastPage) setPage(lastPage);
      else await load(page);
    } else {
      window.alert((await res.json()).error ?? "삭제에 실패했습니다.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const windowStart = Math.max(
    1,
    Math.min(
      currentPage - Math.floor((PAGE_WINDOW - 1) / 2),
      totalPages - PAGE_WINDOW + 1
    )
  );
  const pageWindow = Array.from(
    { length: Math.min(PAGE_WINDOW, totalPages) },
    (_, i) => windowStart + i
  );

  // text-base(16px) — 16px 미만이면 아이폰이 입력창을 누를 때 화면을 확대해 버린다
  const inputBase =
    "rounded-md border border-hairline bg-white px-3 py-2.5 font-body text-base text-body focus:border-accent focus:outline-none";

  return (
    <Section eyebrow="Guestbook" className="bg-canvas">
      <div className="mx-auto max-w-sm">
        <h2 className="text-center font-display text-xl text-ink">방명록</h2>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="flex gap-2">
            <input
              className={`${inputBase} min-w-0 flex-1`}
              placeholder="이름"
              aria-label="이름"
              maxLength={NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={`${inputBase} w-32`}
              placeholder="비밀번호 4자리"
              aria-label="비밀번호 숫자 4자리 (글 삭제 시 필요)"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="relative">
            <textarea
              className={`${inputBase} h-24 w-full resize-none`}
              placeholder="축하 메시지를 남겨주세요"
              aria-label="축하 메시지"
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {message.length > MESSAGE_MAX * 0.8 && (
              <span className="absolute bottom-2 right-3 font-body text-xs text-muted">
                {message.length}/{MESSAGE_MAX}
              </span>
            )}
          </div>
          {/* 봇 차단용. 화면·스크린리더 모두에서 숨긴다 */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <p className="font-body text-sm text-muted">
            비밀번호는 글을 삭제할 때 필요해요.
          </p>
          {err && (
            <p className="font-body text-sm text-danger" role="alert">
              {err}
            </p>
          )}
          {done && !err && (
            <p className="font-body text-sm text-body" role="status">
              소중한 축하 메시지 감사합니다.
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="min-h-12 w-full rounded-md bg-ink font-body text-white disabled:opacity-50"
          >
            {status === "sending" ? "남기는 중..." : "메시지 남기기"}
          </button>
        </form>

        <ul className="mt-8 space-y-4">
          {entries.map((e) => (
            <li key={e.id} className="border-b border-hairline pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm">
                  <span className="font-semibold text-ink">{e.name}</span>
                  <span className="ml-2 text-muted">{formatDate(e.created_at)}</span>
                </span>
                <button
                  onClick={() => remove(e.id)}
                  className="-mr-2 px-2 py-2 font-body text-sm text-muted hover:text-accent-ink"
                  aria-label={`${e.name}님 글 삭제`}
                >
                  삭제
                </button>
              </div>
              <p className="mt-1 whitespace-pre-line break-words font-body text-base leading-relaxed text-body">
                {e.message}
              </p>
            </li>
          ))}
          {total === 0 && (
            <li className="py-6 text-center font-body text-sm text-muted">
              첫 번째 축하 메시지를 남겨주세요.
            </li>
          )}
        </ul>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1 font-body text-sm">
            <button
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="min-h-11 px-3 text-muted disabled:opacity-30"
              aria-label="이전 페이지"
            >
              이전
            </button>
            {pageWindow.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-label={`${n} 페이지`}
                aria-current={n === currentPage ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  n === currentPage ? "bg-accent-ink text-white" : "text-muted"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="min-h-11 px-3 text-muted disabled:opacity-30"
              aria-label="다음 페이지"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
