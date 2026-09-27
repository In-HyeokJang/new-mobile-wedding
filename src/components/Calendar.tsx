"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import { ddayKST, toICSDate, weddingStart } from "@/lib/wedding-time";
import type { CalendarData, Theme } from "@/types";

// 캘린더 저장에 쓰는 일정 정보
export type CalendarEvent = {
  title: string; // 예: "장인혁 ♥ 박재은 결혼식"
  location: string; // 예: "더뉴컨벤션 웨딩홀 5층 제니스홀, 서울 강서구 ..."
};

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

// 하트. 예식일 표시와 그 주변 장식에 같이 쓴다.
function Heart({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// 예식일 칸을 둘러싸는 작은 하트들.
// 좌우로 붙이면 옆 날짜(12, 14)와 겹치므로 위아래 여백 쪽 모서리로만 보낸다.
const SPARKLES = [
  { cls: "-top-1 left-0 h-2 w-2", delay: "0ms" },
  { cls: "-top-1.5 right-0.5 h-1.5 w-1.5", delay: "600ms" },
  { cls: "-bottom-1 right-0 h-2 w-2", delay: "1200ms" },
  { cls: "-bottom-1.5 left-0.5 h-1.5 w-1.5", delay: "1800ms" },
];

// 휴대폰 캘린더에 일정 추가.
// 아이폰은 .ics 파일을 열면 바로 "캘린더에 추가" 화면이 뜬다.
// 안드로이드는 .ics 를 받아도 파일로 저장될 뿐이라 구글 캘린더 추가 화면으로 보낸다.
function addToCalendar(data: CalendarData, event: CalendarEvent) {
  if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) {
    window.location.href = "/wedding.ics";
    return;
  }
  const start = weddingStart(data);
  const end = new Date(start.getTime() + data.durationMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    location: event.location,
  });
  window.open(
    `https://calendar.google.com/calendar/render?${params}`,
    "_blank",
    "noopener"
  );
}

// 달력 + D-day. D-day는 "오늘" 기준이라 클라이언트에서 계산.
// 날짜 계산은 전부 한국시간 기준(lib/wedding-time) — 해외 하객 폰에서도 같은 값이 나온다.
export default function Calendar({
  data,
  theme,
  names,
  event,
}: {
  data: CalendarData;
  theme: Theme;
  names: [string, string]; // D-day 문구의 "인혁❤재은"
  event: CalendarEvent;
}) {
  const [dday, setDday] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    // 오늘 기준 D-day는 브라우저에서만 계산(하이드레이션 안전). 마운트 후 1회 setState — 의도된 패턴.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDday(ddayKST(data));
  }, [data]);

  useEffect(() => {
    const target = weddingStart(data);
    function tick() {
      const r = getRemaining(target);
      setRemaining(r);
      // 예식 시각이 지나면 더 셀 게 없다
      if (!r) clearInterval(id);
    }
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [data]);

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
        {/* 날짜 박스와 아래 카운트다운을 같은 복숭아빛 면으로 통일한다.
            테두리(hairline)는 캔버스와 명도차가 거의 없어 안 보이므로 걷어냈다.
            "12" = 알파 7% (기존 "0d" 5%에서 살짝 올림) */}
        <div
          className="rounded-2xl px-6 py-7"
          style={{ background: `${theme.accent}12` }}
        >
          <div className="flex items-center justify-center gap-3">
            <FlowerFlourish className="h-4 w-4 text-accent" />
            {/* 320px 폰에서는 3xl 이면 두 줄로 깨진다 → 좁은 화면만 한 단계 작게 */}
            <p className="whitespace-nowrap font-display text-2xl tracking-wide text-ink min-[360px]:text-3xl">
              {data.year}. {String(data.month).padStart(2, "0")}.{" "}
              {String(data.day).padStart(2, "0")}
            </p>
            <FlowerFlourish className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 font-body text-sm text-muted">{data.timeText}</p>
        </div>

        <p className="mt-10 font-display text-xl text-ink">{data.month}월</p>

        <div className="mt-5 grid grid-cols-7 gap-y-2 text-sm">
          {WEEK.map((w, i) => (
            <div
              key={w}
              className={`font-body ${i === 0 ? "text-heart-ink" : "text-muted"}`}
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            const isDay = d === data.day;
            // 첫 열이 일요일. 날짜가 전부 같은 색이면 달력이 평평해 보인다
            const isSunday = i % 7 === 0;

            if (d && isDay) {
              return (
                <div
                  key={i}
                  className="relative flex h-9 items-center justify-center"
                >
                  {SPARKLES.map((s) => (
                    <Heart
                      key={s.cls}
                      className={`heart-pulse pointer-events-none absolute text-heart-soft ${s.cls}`}
                      // 하나씩 어긋나게 뛰도록 시작 시점을 밀어준다
                      style={{ animationDelay: s.delay }}
                    />
                  ))}
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    <Heart className="absolute inset-0 h-8 w-8 text-heart" />
                    {/* 하트는 아래로 뾰족해 무게중심이 위에 있다 → 숫자를 1px 올려야 가운데로 보인다 */}
                    <span className="relative -translate-y-px font-body text-sm font-semibold text-white">
                      {d}
                    </span>
                  </span>
                </div>
              );
            }

            return (
              <div key={i} className="flex h-9 items-center justify-center">
                {d && (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-body ${
                      isSunday ? "text-heart-ink" : "text-body"
                    }`}
                  >
                    {d}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* D-day 줄도 같은 면 처리를 해서 떠 있는 글자가 아니라 하나의 표식으로 읽히게 */}
        <div className="mt-8">
          {dday === null ? (
            <span>&nbsp;</span>
          ) : (
            <span
              className="inline-block rounded-full px-4 py-1.5 font-body text-sm text-body"
              style={{ background: `${theme.accent}12` }}
            >
              {dday > 0 ? (
                <>
                  {names[0]}
                  <span className="text-heart">❤</span>
                  {names[1]} 결혼식까지{" "}
                  <span className="font-semibold text-accent-ink">D-{dday}</span>
                </>
              ) : dday === 0 ? (
                <span className="font-semibold text-accent-ink">
                  D-DAY · 오늘 결혼합니다
                </span>
              ) : (
                <>결혼한 지 {-dday}일</>
              )}
            </span>
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
                className="rounded-xl py-3.5"
                style={{ background: `${theme.accent}12` }}
              >
                <p className="font-display text-2xl tabular-nums text-accent">
                  {String(unit.value).padStart(2, "0")}
                </p>
                <p className="mt-0.5 font-body text-[13px] text-muted">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {(dday === null || dday >= 0) && (
          <button
            onClick={() => addToCalendar(data, event)}
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-hairline bg-white px-5 font-body text-sm text-body"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-4 w-4 text-muted"
            >
              <rect x="3.5" y="5" width="17" height="15" rx="2" />
              <path d="M3.5 10h17M8 3v4M16 3v4" />
            </svg>
            내 캘린더에 저장
          </button>
        )}
      </div>
    </Section>
  );
}
