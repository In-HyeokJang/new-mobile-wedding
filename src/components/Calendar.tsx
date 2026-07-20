"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import type { CalendarData, Theme } from "@/types";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 달력 + D-day. D-day는 "오늘" 기준이라 클라이언트에서 계산.
export default function Calendar({
  data,
  theme,
}: {
  data: CalendarData;
  theme: Theme;
}) {
  const [dday, setDday] = useState<number | null>(null);

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
        <p className="font-display text-2xl text-ink">
          {data.year}. {String(data.month).padStart(2, "0")}.{" "}
          {String(data.day).padStart(2, "0")}
        </p>
        <p className="mt-1 font-body text-sm text-muted">{data.timeText}</p>

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
      </div>
    </Section>
  );
}
