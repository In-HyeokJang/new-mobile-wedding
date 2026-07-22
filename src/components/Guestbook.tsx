"use client";

import { useCallback, useEffect, useState } from "react";
import Section from "./Section";
import type { GuestbookEntry } from "@/types";

const PAGE_SIZE = 5;

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook");
      const json = await res.json();
      if (res.ok) setEntries(json.entries ?? []);
    } catch {
      /* 목록 로드 실패는 조용히 무시 */
    }
  }, []);

  useEffect(() => {
    // 마운트 시 방명록 목록 fetch(외부 데이터 동기화) — 의도된 패턴.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !pin.trim() || !message.trim()) {
      setErr("이름·비밀번호·메시지를 모두 입력해 주세요.");
      return;
    }
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin, message }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "작성 실패");
      setMessage("");
      setPin("");
      await load();
      setPage(1); // 새 글은 최신순 1페이지에 보이니 첫 페이지로 이동
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "작성에 실패했습니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function remove(id: number) {
    const inputPin = window.prompt("작성 시 입력한 비밀번호를 입력하세요.");
    if (!inputPin) return;
    const res = await fetch("/api/guestbook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pin: inputPin }),
    });
    if (res.ok) await load();
    else window.alert((await res.json()).error ?? "삭제 실패");
  }

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageEntries = entries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const inputBase =
    "rounded-md border border-hairline bg-white px-3 py-2 font-body text-body focus:border-accent focus:outline-none";

  return (
    <Section eyebrow="Guestbook" className="bg-canvas">
      <div className="mx-auto max-w-sm">
        <p className="text-center font-display text-xl text-ink">방명록</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="flex gap-2">
            <input
              className={`${inputBase} flex-1`}
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={`${inputBase} w-28`}
              placeholder="비밀번호"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
          <textarea
            className={`${inputBase} h-20 w-full resize-none`}
            placeholder="축하 메시지를 남겨주세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {err && <p className="font-body text-sm text-accent">{err}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-md bg-ink py-2.5 font-body text-white disabled:opacity-50"
          >
            {status === "sending" ? "남기는 중..." : "메시지 남기기"}
          </button>
        </form>

        <ul className="mt-8 space-y-4">
          {pageEntries.map((e) => (
            <li key={e.id} className="border-b border-hairline pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold text-ink">
                  {e.name}
                </span>
                <button
                  onClick={() => remove(e.id)}
                  className="font-body text-xs text-muted hover:text-accent"
                  aria-label="삭제"
                >
                  삭제
                </button>
              </div>
              <p className="mt-1 font-body text-sm leading-relaxed text-body">
                {e.message}
              </p>
            </li>
          ))}
          {entries.length === 0 && (
            <li className="py-6 text-center font-body text-sm text-muted">
              첫 번째 축하 메시지를 남겨주세요.
            </li>
          )}
        </ul>

        {entries.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-center gap-4 font-body text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-muted disabled:opacity-30"
              aria-label="이전 페이지"
            >
              이전
            </button>
            <span className="text-muted">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-muted disabled:opacity-30"
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
