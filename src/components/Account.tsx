"use client";

import { useState } from "react";
import Section from "./Section";
import type { AccountData, AccountEntry, AccountSide } from "@/types";

// 계좌 한 줄 + 복사 버튼.
// 하객이 은행 앱으로 옮겨 적는 수고를 없애는 게 이 섹션의 존재 이유라
// 복사가 됐는지 눈에 보이게 알려주는 게 중요하다.
function AccountRow({ a }: { a: AccountEntry }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      // 하이픈을 뺀 숫자만 복사 — 은행 앱 입력창이 하이픈을 거부하는 경우가 있다
      await navigator.clipboard.writeText(a.number.replace(/[^0-9]/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한 없으면 조용히 무시 */
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 border-t border-hairline py-3 first:border-t-0">
      <div className="min-w-0 text-left">
        <p className="font-body text-xs text-muted">
          {a.relation} {a.name}
        </p>
        <p className="mt-0.5 truncate font-body text-sm text-ink">
          {a.bank} {a.number}
        </p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 rounded-md border border-hairline px-3 py-1.5 font-body text-xs text-body"
      >
        {copied ? "복사됨" : "복사"}
      </button>
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

// 신랑측 / 신부측 한 묶음. 접지 않고 항상 펼쳐 둔다.
function SideCard({ side }: { side: AccountSide }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-white">
      <p
        className={`border-b border-hairline px-4 py-3 font-body text-sm font-semibold ${
          TONE[side.tone ?? "none"]
        }`}
      >
        {side.label}
      </p>
      <ul className="px-4 pb-1">
        {side.accounts.map((a, i) => (
          <AccountRow key={i} a={a} />
        ))}
      </ul>
    </div>
  );
}

export default function Account({ data }: { data: AccountData }) {
  return (
    <Section eyebrow="Account" className="bg-canvas text-center">
      <div className="mx-auto max-w-xs">
        <p className="font-display text-xl text-ink">마음 전하실 곳</p>
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
