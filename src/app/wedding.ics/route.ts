import { config } from "@/config";
import { toICSDate, weddingStart } from "@/lib/wedding-time";

// GET /wedding.ics — 아이폰 "캘린더에 추가"용 일정 파일 (Calendar.tsx 의 저장 버튼).
// config 값으로 만들므로 날짜·장소를 바꾸면 파일도 같이 바뀐다.
export const dynamic = "force-static";

// ICS 텍스트 값의 특수문자 이스케이프 (RFC 5545)
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

export function GET() {
  const { calendar, intro, location, share } = config;
  const start = weddingStart(calendar);
  const end = new Date(start.getTime() + calendar.durationMinutes * 60_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//mobile-wedding//KO",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:wedding-${toICSDate(start)}@${new URL(share.siteUrl).host}`,
    `DTSTAMP:${toICSDate(start)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${esc(`${intro.groomName} ♥ ${intro.brideName} 결혼식`)}`,
    `LOCATION:${esc(`${location.name} ${location.hallText}, ${location.address}`)}`,
    `URL:${share.siteUrl}`,
    // 하루 전 알림
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:내일 결혼식이 있습니다",
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="wedding.ics"',
    },
  });
}
