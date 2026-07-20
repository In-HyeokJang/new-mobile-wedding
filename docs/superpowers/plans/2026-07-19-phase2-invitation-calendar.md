# Phase 2: Invitation + Calendar/D-day Implementation Plan

> **For agentic workers:** 인라인 실행. 각 태스크 끝에 검증·커밋.

**Goal:** 인사말+혼주(Invitation)와 달력+D-day(Calendar) 섹션을 config props 주입 구조로 추가하고, Intro 아래에 배치한다.

**Architecture:** Invitation은 정적 → 서버 컴포넌트. Calendar의 D-day 숫자는 "오늘" 기준이라 매일 바뀌므로 클라이언트 컴포넌트에서 계산(SSG 정적 렌더의 시간 고정 문제 회피). 달력 그리드는 순수 계산.

**Tech Stack:** Next.js 16, React 19(클라이언트 컴포넌트/훅), Tailwind v4.

## Global Constraints
- Phase 1과 동일 토큰/폰트, props 주입, dev 브랜치, 무료 리소스.
- 예식 target: 2026-12-13 13:30.

---

## 파일 구조 (Phase 2)
```
src/
├── types.ts            # InvitationData, CalendarData 추가
├── config.ts           # invitation, calendar 데이터 추가
├── components/
│   ├── Section.tsx      # 공통 섹션 래퍼(제목 eyebrow + 여백)
│   ├── Invitation.tsx   # 인사말 + 혼주 (server)
│   └── Calendar.tsx     # 달력 + D-day (client)
└── app/page.tsx         # Intro → Invitation → Calendar 배치
```

---

### Task 5: 타입 & config 확장

**Files:** Modify `src/types.ts`, `src/config.ts`

**Interfaces produced:**
- `InvitationData { greeting: string[]; groom: ParentLine; bride: ParentLine }`
- `ParentLine { fatherName?: string; motherName?: string; childRelation: string; childName: string }`
- `CalendarData { year:number; month:number; day:number; timeText:string }`
- `config.invitation`, `config.calendar`

- [ ] **Step 1: types.ts에 추가**
```ts
export type ParentLine = {
  fatherName?: string;
  motherName?: string;
  childRelation: string; // "아들" | "딸"
  childName: string;
};
export type InvitationData = {
  greeting: string[];
  groom: ParentLine;
  bride: ParentLine;
};
export type CalendarData = {
  year: number;
  month: number; // 1-12
  day: number;
  timeText: string; // "오후 1시 30분"
};
```
그리고 `InvitationConfig`에 `invitation: InvitationData; calendar: CalendarData;` 추가.

- [ ] **Step 2: config.ts에 데이터 추가**
```ts
invitation: {
  greeting: [
    "서로가 마주 보며 다져온 사랑을",
    "이제 함께 한 곳을 바라보며",
    "걸어갈 수 있는 큰 사랑으로 키우려 합니다.",
    "저희 두 사람의 시작을 축복해 주세요.",
  ],
  groom: { fatherName: "장○○", motherName: "○○○", childRelation: "아들", childName: "장인혁" },
  bride: { fatherName: "○○○", motherName: "○○○", childRelation: "딸", childName: "○○○" },
},
calendar: { year: 2026, month: 12, day: 13, timeText: "오후 1시 30분" },
```

- [ ] **Step 3: 검증** `npx tsc --noEmit` → 에러 없음.
- [ ] **Step 4: Commit** `feat: invitation/calendar 타입+config`

---

### Task 6: 공통 Section 래퍼 + Invitation 섹션

**Files:** Create `src/components/Section.tsx`, `src/components/Invitation.tsx`; Modify `src/app/page.tsx`

**Interfaces:**
- Consumes: `InvitationData`, `Theme`.
- Produces: `<Section eyebrow title>`, `<Invitation data theme />`.

- [ ] **Step 1: Section.tsx (공통 래퍼)**
```tsx
export default function Section({
  eyebrow, children, className = "",
}: { eyebrow?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`px-8 py-20 ${className}`}>
      {eyebrow && (
        <p className="mb-10 text-center font-body text-xs uppercase tracking-[0.35em] text-accent">
          {eyebrow}
        </p>
      )}
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Invitation.tsx (server)**
```tsx
import Section from "./Section";
import type { InvitationData } from "@/types";

function ParentNames({ p }: { p: InvitationData["groom"] }) {
  return (
    <p className="font-body text-body">
      {p.fatherName && <span>{p.fatherName}</span>}
      {p.fatherName && p.motherName && <span className="text-muted"> · </span>}
      {p.motherName && <span>{p.motherName}</span>}
      <span className="text-muted">의 {p.childRelation} </span>
      <span className="text-ink">{p.childName}</span>
    </p>
  );
}

export default function Invitation({ data }: { data: InvitationData }) {
  return (
    <Section eyebrow="Invitation" className="bg-canvas text-center">
      <div className="mx-auto max-w-md">
        <div className="space-y-2 font-display text-lg leading-relaxed text-ink">
          {data.greeting.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div className="mx-auto my-12 h-px w-12 bg-hairline" />
        <div className="space-y-3">
          <ParentNames p={data.groom} />
          <ParentNames p={data.bride} />
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: page.tsx에 배치**
```tsx
import Intro from "@/components/Intro";
import Invitation from "@/components/Invitation";
import { config } from "@/config";

export default function Home() {
  return (
    <main className="bg-canvas">
      <Intro data={config.intro} theme={config.theme} />
      <Invitation data={config.invitation} />
    </main>
  );
}
```

- [ ] **Step 4: 검증** dev 서버(http://localhost:3000) 200 + "Invitation" eyebrow, 인사말, 혼주 렌더.
- [ ] **Step 5: Commit** `feat: Invitation 섹션(인사말+혼주)`

---

### Task 7: Calendar + D-day 섹션 (클라이언트 컴포넌트)

**Files:** Create `src/components/Calendar.tsx`; Modify `src/app/page.tsx`

**Interfaces:**
- Consumes: `CalendarData`, `Theme`.
- Produces: `<Calendar data theme />`.

**개념:** D-day는 "오늘" 기준이라 서버 정적 렌더 시점에 고정되면 안 됨 → `"use client"` + `useState/useEffect`로 마운트 후 계산(하이드레이션 불일치 방지: 초기엔 null, 마운트 후 값).

- [ ] **Step 1: Calendar.tsx**
```tsx
"use client";
import { useEffect, useState } from "react";
import Section from "./Section";
import type { CalendarData, Theme } from "@/types";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar({ data, theme }: { data: CalendarData; theme: Theme }) {
  const [dday, setDday] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(data.year, data.month - 1, data.day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    setDday(diff);
  }, [data.year, data.month, data.day]);

  // 달력 그리드 계산
  const firstDay = new Date(data.year, data.month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(data.year, data.month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Section eyebrow="The Day" className="bg-canvas text-center">
      <div className="mx-auto max-w-xs">
        <p className="font-display text-2xl text-ink">
          {data.year}. {String(data.month).padStart(2, "0")}. {String(data.day).padStart(2, "0")}
        </p>
        <p className="mt-1 font-body text-sm text-muted">{data.timeText}</p>

        <div className="mt-8 grid grid-cols-7 gap-y-2 text-sm">
          {WEEK.map((w, i) => (
            <div key={w} className={`font-body ${i === 0 ? "text-accent" : "text-muted"}`}>{w}</div>
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

        <p className="mt-8 font-body text-sm text-muted">
          {dday === null
            ? " "
            : dday > 0
            ? <>결혼식까지 <span className="font-semibold text-accent">D-{dday}</span></>
            : dday === 0
            ? <span className="font-semibold text-accent">D-DAY</span>
            : `결혼한 지 ${-dday}일`}
        </p>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: page.tsx에 Calendar 추가** (Invitation 아래)
```tsx
import Calendar from "@/components/Calendar";
// ...
<Invitation data={config.invitation} />
<Calendar data={config.calendar} theme={config.theme} />
```

- [ ] **Step 3: 검증** dev 200 + 달력 그리드(13 오렌지 원) + "결혼식까지 D-xxx".
- [ ] **Step 4: 빌드** `npm run build` 성공.
- [ ] **Step 5: Commit & Push** `feat: Calendar+D-day 섹션` → `git push origin dev`

---

## Self-Review
- Spec coverage: Invitation(인사말+혼주, §6-2), Calendar/D-day(§6-3) 태스크 존재.
- Placeholder: config의 부모/신부 이름은 실제값 대기(의도적 TODO).
- Type 일관성: `ParentLine`, `InvitationData`, `CalendarData` 정의(Task5) ↔ 사용(Task6/7) 필드명 일치.
