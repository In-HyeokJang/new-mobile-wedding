"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import type { CalendarData, Theme } from "@/types";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(target: Date): Remaining | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

// 결혼 날짜를 감싸는 작은 라인아트 플라워 장식.
function FlowerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="12" cy="6.8" r="3.2" />
        <circle cx="12" cy="17.2" r="3.2" />
        <circle cx="6.8" cy="12" r="3.2" />
        <circle cx="17.2" cy="12" r="3.2" />
      </g>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

// 달력 + D-day. D-day는 "오늘" 기준이라 클라이언트에서 계산.
export default function Calendar({
  data,
  theme,
}: {
  data: CalendarData;
  theme: Theme;
}) {
  const [dday, setDday] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = new Date(data.year, data.month - 1, data.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (target.getTime() - today.getTime()) / 86_400_000
    );
    // 오늘 기준 D-day는 브라우저에서만 계산(하이드레이션 안전). 마운트 후 1회 setState — 의도된 패턴.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDday(diff);
  }, [data.year, data.month, data.day]);

  useEffect(() => {
    const target = new Date(
      data.year,
      data.month - 1,
      data.day,
      data.hour,
      data.minute
    );
    function tick() {
      setRemaining(getRemaining(target));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.year, data.month, data.day, data.hour, data.minute]);

  // 달력 그리드 계산 (순수 계산 — 서버/클라 동일)
  const firstDay = new Date(data.year, data.month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(data.year, data.month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Section eyebrow="The Day" className="bg-canvas text-center">
      <div className="mx-auto max-w-xs">
        <div
          className="rounded-2xl border px-6 py-7"
          style={{ borderColor: theme.hairline, background: `${theme.accent}0d` }}
        >
          <div className="flex items-center justify-center gap-3">
            <FlowerFlourish className="h-4 w-4 text-accent" />
            <p className="font-display text-3xl tracking-wide text-ink">
              {data.year}. {String(data.month).padStart(2, "0")}.{" "}
              {String(data.day).padStart(2, "0")}
            </p>
            <FlowerFlourish className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-body text-sm text-muted">{data.timeText}</p>
        </div>

        <div className="mt-8 grid grid-cols-7 gap-y-2 text-sm">
          {WEEK.map((w, i) => (
            <div
              key={w}
              className={`font-body ${i === 0 ? "text-accent" : "text-muted"}`}
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            const isDay = d === data.day;
            return (
              <div key={i} className="flex h-9 items-center justify-center">
                {d && (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-body ${
                      isDay ? "text-white" : "text-body"
                    }`}
                    style={isDay ? { background: theme.accent } : undefined}
                  >
                    {d}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 font-body text-sm text-muted">
          {dday === null ? (
            <span>&nbsp;</span>
          ) : dday > 0 ? (
            <span>
              결혼식까지{" "}
              <span className="font-semibold text-accent">D-{dday}</span>
            </span>
          ) : dday === 0 ? (
            <span className="font-semibold text-accent">D-DAY</span>
          ) : (
            <span>결혼한 지 {-dday}일</span>
          )}
        </div>

        {remaining && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: "일", value: remaining.days },
              { label: "시간", value: remaining.hours },
              { label: "분", value: remaining.minutes },
              { label: "초", value: remaining.seconds },
            ].map((unit) => (
              <div
                key={unit.label}
                className="rounded-xl border py-3"
                style={{ borderColor: theme.hairline }}
              >
                <p className="font-display text-xl tabular-nums text-accent">
                  {String(unit.value).padStart(2, "0")}
                </p>
                <p className="mt-0.5 font-body text-[10px] text-muted">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
