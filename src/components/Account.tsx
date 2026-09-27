"use client";

import { useId, useState } from "react";
import Section from "./Section";
import { copyText } from "@/lib/clipboard";
import type { AccountData, AccountEntry, AccountSide } from "@/types";

// 계좌 한 줄 + 복사 버튼.
// 하객이 은행 앱으로 옮겨 적는 수고를 없애는 게 이 섹션의 존재 이유라
// 복사가 됐는지 눈에 보이게 알려주는 게 중요하다.
function AccountRow({ a }: { a: AccountEntry }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    // 하이픈을 뺀 숫자만 복사 — 은행 앱 입력창이 하이픈을 거부하는 경우가 있다
    const ok = await copyText(a.number.replace(/[^0-9]/g, ""));
    setState(ok ? "copied" : "failed");
    setTimeout(() => setState("idle"), ok ? 1500 : 4000);
  }

  return (
    <li className="border-t border-hairline py-3 first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <p className="font-body text-sm text-muted">
            {a.relation} {a.name}
          </p>
          {/* 좁은 폰(320px)에서 번호가 잘리지 않도록 은행명과 번호를 줄로 나눈다.
              selectable — 복사 버튼이 막힌 인앱 브라우저에서 길게 눌러 복사할 수 있게 */}
          <p className="selectable mt-0.5 font-body text-base text-ink">
            <span className="mr-1.5">{a.bank}</span>
            <span className="whitespace-nowrap tabular-nums">{a.number}</span>
          </p>
        </div>
        <button
          onClick={copy}
          className="min-h-11 shrink-0 rounded-md border border-hairline px-4 font-body text-sm text-body"
          aria-label={`${a.relation} ${a.name} 계좌번호 복사`}
        >
          {state === "copied" ? "복사됨" : "복사"}
        </button>
      </div>
      {state === "failed" && (
        <p className="mt-1.5 text-left font-body text-sm text-danger" role="status">
          복사가 안 되는 환경이에요. 계좌번호를 길게 눌러 복사해 주세요.
        </p>
      )}
    </li>
  );
}

// 라벨 칸 배경색. 클래스명을 문자열로 조립하면 Tailwind 가 스캔에서 놓치므로
// 완성된 클래스명을 그대로 적어 둔다.
const TONE = {
  groom: "bg-groom text-groom-ink",
  bride: "bg-bride text-bride-ink",
  none: "bg-canvas text-ink",
} as const;

// 신랑측 / 신부측 한 묶음. 라벨 버튼을 눌러야 계좌가 펼쳐진다 —
// 계좌번호가 처음부터 전부 펼쳐져 있으면 섹션이 길고 부담스럽게 보인다.
// 여닫는 방식은 오시는 길의 교통 안내(Location.tsx FoldableInfo)와 같다.
function SideCard({ side }: { side: AccountSide }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex min-h-12 w-full items-center justify-between px-4 font-body text-base font-semibold ${
          TONE[side.tone ?? "none"]
        }`}
      >
        {side.label} 계좌번호
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="border-t border-hairline px-4 pb-1">
            {side.accounts.map((a, i) => (
              <AccountRow key={i} a={a} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Account({ data }: { data: AccountData }) {
  return (
    <Section eyebrow="Account" className="bg-canvas text-center">
      <div className="mx-auto max-w-xs">
        <h2 className="font-display text-xl text-ink">마음 전하실 곳</h2>
        {data.note && (
          <p className="mt-2 font-body text-sm leading-relaxed text-muted">
            {data.note}
          </p>
        )}

        <div className="mt-6 space-y-3">
          {data.sides.map((side) => (
            <SideCard key={side.label} side={side} />
          ))}
        </div>
      </div>
    </Section>
  );
}
