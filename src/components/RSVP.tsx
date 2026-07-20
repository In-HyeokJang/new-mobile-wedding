"use client";

import { useState } from "react";
import Section from "./Section";
import type { RsvpInput } from "@/types";

// 참석 의사 폼. 제출 시 /api/rsvp 로 POST.
export default function RSVP() {
  const [form, setForm] = useState<RsvpInput>({
    side: "신랑측",
    name: "",
    attend: true,
    guestCount: 1,
    meal: true,
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrMsg("성함을 입력해 주세요.");
      return;
    }
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "전송 실패");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "전송에 실패했습니다.");
    }
  }

  const inputBase =
    "w-full rounded-md border border-hairline bg-white px-3 py-2 font-body text-body focus:border-accent focus:outline-none";

  if (status === "done") {
    return (
      <Section eyebrow="RSVP" className="bg-canvas text-center">
        <div className="mx-auto max-w-sm">
          <p className="font-display text-2xl text-ink">감사합니다 🙏</p>
          <p className="mt-3 font-body text-body">
            참석 의사가 전달되었습니다.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section eyebrow="RSVP" className="bg-canvas">
      <form onSubmit={submit} className="mx-auto max-w-sm space-y-4">
        <p className="text-center font-display text-xl text-ink">
          참석 의사 전달
        </p>

        {/* 신랑측/신부측 */}
        <div className="flex gap-2">
          {(["신랑측", "신부측"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, side: s })}
              className={`flex-1 rounded-md border py-2 font-body text-sm ${
                form.side === s
                  ? "border-accent bg-accent text-white"
                  : "border-hairline bg-white text-body"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 참석/불참 */}
        <div className="flex gap-2">
          {[
            { label: "참석", val: true },
            { label: "불참", val: false },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setForm({ ...form, attend: o.val })}
              className={`flex-1 rounded-md border py-2 font-body text-sm ${
                form.attend === o.val
                  ? "border-accent bg-accent text-white"
                  : "border-hairline bg-white text-body"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <input
          className={inputBase}
          placeholder="성함"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="flex items-center gap-3">
          <label className="font-body text-sm text-muted">참석 인원</label>
          <input
            type="number"
            min={1}
            className={`${inputBase} w-24`}
            value={form.guestCount}
            onChange={(e) =>
              setForm({ ...form, guestCount: Number(e.target.value) || 1 })
            }
          />
          <label className="ml-auto flex items-center gap-2 font-body text-sm text-muted">
            <input
              type="checkbox"
              checked={form.meal}
              onChange={(e) => setForm({ ...form, meal: e.target.checked })}
            />
            식사 예정
          </label>
        </div>

        <input
          className={inputBase}
          placeholder="연락처 (선택)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <textarea
          className={`${inputBase} h-20 resize-none`}
          placeholder="전하고 싶은 말 (선택)"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />

        {errMsg && (
          <p className="font-body text-sm text-accent">{errMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-md bg-ink py-3 font-body text-white disabled:opacity-50"
        >
          {status === "sending" ? "전송 중..." : "참석 의사 보내기"}
        </button>
      </form>
    </Section>
  );
}
