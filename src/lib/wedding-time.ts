import type { CalendarData } from "@/types";

// 예식 시각은 항상 한국시간(KST, UTC+9) 기준이다.
// new Date(y, m, d, h, mi) 는 "기기 시간대"로 해석돼서, 해외에 있는 하객 폰에서는
// 카운트다운이 몇 시간씩 어긋난다. UTC 로 환산해 절대 시각으로 만든다.
const KST_OFFSET_HOURS = 9;

export function weddingStart(c: CalendarData): Date {
  return new Date(
    Date.UTC(c.year, c.month - 1, c.day, c.hour - KST_OFFSET_HOURS, c.minute)
  );
}

// 오늘(한국 날짜) 기준 D-day. 양수 = 남은 날, 0 = 당일, 음수 = 지난 날.
export function ddayKST(c: CalendarData, now = new Date()): number {
  // en-CA 로케일은 "YYYY-MM-DD" 형식을 준다
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" })
    .format(now)
    .split("-")
    .map(Number);
  return Math.round(
    (Date.UTC(c.year, c.month - 1, c.day) - Date.UTC(y, m - 1, d)) / 86_400_000
  );
}

// 캘린더 파일/링크용 "20261213T043000Z" 형식
export function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
