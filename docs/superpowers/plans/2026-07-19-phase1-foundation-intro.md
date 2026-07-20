# Phase 1: 기반 + Intro 슬라이스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 프로젝트를 세우고 디자인 토큰·폰트·config 타입을 갖춘 뒤, config에서 props를 주입받아 렌더되는 첫 화면(Intro)까지 배포 가능한 형태로 완성한다.

**Architecture:** Next.js App Router. 컴포넌트는 전역 config를 직접 import하지 않고 `props`로 데이터/테마를 주입받는다(빌더 확장 대비). 디자인 토큰은 Tailwind theme + CSS 변수로 중앙화. Intro는 서버 컴포넌트로 흑백 풀블리드 사진 위 하단 정렬 텍스트.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Google Fonts(Fraunces), Pretendard.

## Global Constraints

- 전부 무료 리소스만 사용 (폰트/DB/호스팅 무료 티어).
- 디자인 베이스 = Claude(`DESIGN.md`). 토큰: canvas `#faf9f5`, ink `#141413`, body `#3d3d3a`, muted `#6c6a64`, hairline `#e6dfd8`, **accent `#FF630F`**.
- 사진은 흑백(`grayscale`) 풀블리드, 텍스트 하단 정렬.
- 디스플레이 폰트 = Fraunces(라틴), 본문 = Pretendard(한글).
- 컴포넌트는 전역 config 직접 참조 금지 → `props` 주입.
- 개발 브랜치 = `dev`. 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- 예식: 2026-12-13(일) 13:30. 신랑/신부 이름 등 실제 데이터는 config에 채운다.

---

## 파일 구조 (Phase 1에서 생성/수정)

```
my-wedding(=프로젝트 루트)
├── package.json                 # create-next-app 생성
├── tailwind.config.ts           # 디자인 토큰(theme.extend)
├── postcss.config.mjs           # create-next-app 생성
├── next.config.ts
├── public/images/main.jpg       # Intro 메인 사진(임시 플레이스홀더 가능)
├── src/
│   ├── types.ts                 # InvitationConfig 타입 정의
│   ├── config.ts                # 내 청첩장 데이터 한 벌
│   ├── app/
│   │   ├── globals.css          # Tailwind 지시어 + CSS 변수 + 폰트 face
│   │   ├── layout.tsx           # 폰트 로딩, <html lang="ko">, 메타데이터
│   │   └── page.tsx             # config 읽어 <Intro> 배치
│   └── components/
│       └── Intro.tsx            # 첫 화면(서버 컴포넌트), props 주입
```

각 파일 책임:
- `types.ts` — 데이터 계약(빌더가 나중에 이 타입을 채움).
- `config.ts` — 실제 청첩장 값. UI 코드와 분리.
- `tailwind.config.ts` / `globals.css` — 디자인 토큰 단일 출처.
- `layout.tsx` — 전역(폰트·언어·OG 메타).
- `page.tsx` — 섹션 배치(순서).
- `Intro.tsx` — 첫 화면 렌더 단위.

---

### Task 1: Next.js 프로젝트 스캐폴드

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/*` (create-next-app 산출물)

**Interfaces:**
- Produces: 동작하는 Next.js(App Router)+TS+Tailwind 프로젝트, `npm run dev` / `npm run build` 가능.

- [ ] **Step 1: 현재 디렉토리에 create-next-app 실행**

기존 파일(DESIGN.md, design-refs/, docs/, .git)을 보존하려면 임시 폴더에 생성 후 병합하거나, create-next-app이 비어있지 않은 디렉토리를 거부하므로 임시 하위 폴더에 만든 뒤 루트로 이동한다.

Run (프로젝트 루트에서):
```bash
npx create-next-app@latest .tmp-next --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
Expected: `.tmp-next/`에 프로젝트 생성 완료.

- [ ] **Step 2: 산출물을 루트로 이동(기존 자산 보존)**

Run (PowerShell):
```powershell
Get-ChildItem -Path .tmp-next -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object { Move-Item -Path $_.FullName -Destination . -Force }
Remove-Item -Recurse -Force .tmp-next
```
Expected: 루트에 `package.json`, `src/app/`, `tailwind` 설정 등장. `DESIGN.md`, `design-refs/`, `docs/` 유지.

- [ ] **Step 3: 의존성 확인 및 dev 서버 기동 검증**

Run:
```bash
npm install
npm run build
```
Expected: build 성공 (`Compiled successfully`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: Next.js(App Router)+TS+Tailwind 스캐폴드"
```

---

### Task 2: 디자인 토큰 & 폰트 세팅

**Files:**
- Modify: `tailwind.config.ts` (theme.extend colors/fontFamily)
- Modify: `src/app/globals.css` (CSS 변수, Pretendard/Fraunces 로드)
- Modify: `src/app/layout.tsx` (Fraunces via next/font/google, Pretendard link)

**Interfaces:**
- Produces: Tailwind 클래스 `bg-canvas text-ink text-accent font-display font-body` 등 사용 가능. CSS 변수 `--font-display`, `--font-body`.

- [ ] **Step 1: Tailwind에 색상/폰트 토큰 추가**

`tailwind.config.ts` theme.extend:
```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#faf9f5",
        ink: "#141413",
        body: "#3d3d3a",
        muted: "#6c6a64",
        hairline: "#e6dfd8",
        accent: "#FF630F",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: globals.css에 Pretendard 로드 + 기본 스타일**

`src/app/globals.css` (Tailwind 지시어 아래에 추가):
```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css");

:root { --font-body: "Pretendard", sans-serif; }

html, body {
  background: theme(colors.canvas);
  color: theme(colors.body);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 3: layout.tsx에서 Fraunces(next/font) 연결**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

export const metadata: Metadata = { title: "우리 결혼합니다" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={fraunces.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: 토큰 동작 검증(임시 화면)**

`src/app/page.tsx`를 임시로:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center bg-canvas">
      <h1 className="font-display text-4xl text-ink">
        Hello <span className="text-accent">#FF630F</span>
      </h1>
    </main>
  );
}
```
Run: `npm run dev` → http://localhost:3000
Expected: 크림 배경, 세리프 제목, "#FF630F"만 오렌지.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 디자인 토큰(Claude 각색) + Fraunces/Pretendard 폰트"
```

---

### Task 3: 데이터 계약(types) & config

**Files:**
- Create: `src/types.ts`
- Create: `src/config.ts`

**Interfaces:**
- Produces: `InvitationConfig` 타입, `config: InvitationConfig` 객체. Intro가 소비할 `config.theme`, `config.intro`.

- [ ] **Step 1: InvitationConfig 타입 정의**

`src/types.ts` (Phase 1 범위: theme + intro. 이후 Phase에서 확장):
```ts
export type Theme = {
  canvas: string; ink: string; body: string;
  muted: string; hairline: string; accent: string;
};

export type IntroData = {
  groomName: string;
  brideName: string;
  dateText: string;   // 예: "2026. 12. 13. SUN 1:30 PM"
  placeText: string;  // 예: "○○웨딩홀 3F 그랜드홀"
  mainPhoto: string;  // 예: "/images/main.jpg"
};

export type InvitationConfig = {
  theme: Theme;
  intro: IntroData;
};
```

- [ ] **Step 2: config.ts에 실제 데이터 작성**

`src/config.ts`:
```ts
import type { InvitationConfig } from "@/types";

export const config: InvitationConfig = {
  theme: {
    canvas: "#faf9f5", ink: "#141413", body: "#3d3d3a",
    muted: "#6c6a64", hairline: "#e6dfd8", accent: "#FF630F",
  },
  intro: {
    groomName: "장인혁",       // TODO: 실제 값 확인
    brideName: "○○○",         // TODO: 신부 이름
    dateText: "2026. 12. 13. SUN 1:30 PM",
    placeText: "○○웨딩홀 그랜드홀",  // TODO: 예식장
    mainPhoto: "/images/main.jpg",
  },
};
```

- [ ] **Step 3: 타입 체크 검증**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: InvitationConfig 타입 + config 데이터(Phase1: intro)"
```

---

### Task 4: Intro 컴포넌트(첫 화면)

**Files:**
- Create: `src/components/Intro.tsx`
- Modify: `src/app/page.tsx`
- Add: `public/images/main.jpg` (임시 플레이스홀더 이미지 가능)

**Interfaces:**
- Consumes: `IntroData`, `Theme` (from `@/types`), `config.intro`.
- Produces: `<Intro data={IntroData} theme={Theme} />` 렌더.

- [ ] **Step 1: Intro 컴포넌트 작성(props 주입, 서버 컴포넌트)**

`src/components/Intro.tsx`:
```tsx
import Image from "next/image";
import type { IntroData, Theme } from "@/types";

export default function Intro({ data, theme }: { data: IntroData; theme: Theme }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <Image
        src={data.mainPhoto}
        alt="main"
        fill
        priority
        className="object-cover grayscale"
      />
      {/* 하단 가독성 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {/* 하단 정렬 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 p-8 pb-12 text-center text-white">
        <p className="font-body text-sm tracking-[0.3em] uppercase opacity-90">
          We're getting married
        </p>
        <h1 className="mt-3 font-display text-5xl leading-tight">
          {data.groomName}
          <span className="mx-3" style={{ color: theme.accent }}>&amp;</span>
          {data.brideName}
        </h1>
        <p className="mt-4 font-body text-base opacity-90">{data.dateText}</p>
        <p className="font-body text-sm opacity-75">{data.placeText}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: page.tsx에서 config 주입**

`src/app/page.tsx`:
```tsx
import Intro from "@/components/Intro";
import { config } from "@/config";

export default function Home() {
  return (
    <main>
      <Intro data={config.intro} theme={config.theme} />
    </main>
  );
}
```

- [ ] **Step 3: 임시 메인 이미지 배치**

`public/images/main.jpg`에 임시 세로 사진을 넣는다(실제 사진은 콘텐츠 준비 후 교체). 없으면 next/image가 404 → 임시로 무료 이미지 1장 저장.

Run: `npm run dev` → 모바일 뷰포트(DevTools)로 확인
Expected: 흑백 풀스크린 사진, 하단에 신랑&신부(&는 오렌지), 날짜/장소. 세로 100svh.

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: Commit & Push(dev)**

```bash
git add -A
git commit -m "feat: Intro 첫 화면(흑백 풀블리드, 하단정렬, props 주입)"
git push origin dev
```

---

## Self-Review

- **Spec coverage(Phase 1 한정):** 스캐폴드(§8-1), 토큰·폰트(§3), config 타입·주입 구조(§4), Intro 섹션(§6) — 모두 태스크 존재. RSVP/Supabase/지도/공유/나머지 섹션은 Phase 2+ 후속 계획(의도된 범위 밖).
- **Placeholder 점검:** config의 `TODO`는 실제 사용자 데이터 대기(값 자체가 미정이라 의도적 표기, 코드 완성도와 무관). 그 외 플레이스홀더 없음.
- **Type 일관성:** `IntroData`/`Theme` 필드명이 Task3 정의 ↔ Task4 사용에서 일치(`groomName`, `brideName`, `dateText`, `placeText`, `mainPhoto`, `accent`).

---

## 다음 Phase (후속 계획으로 분리)
- Phase 2: Invitation(인사말+혼주) + Calendar/D-day (정적/경량 상호작용, 개념: 클라이언트 컴포넌트·상태).
- Phase 3: Gallery(스와이프/라이트박스) + OurStory.
- Phase 4: Supabase 연동 + RSVP + Guestbook (API Route·서버 로직).
- Phase 5: Location(카카오맵) + Share(카톡/OG) + BGM.
- Phase 6: 실제 콘텐츠·사진 흑백화 + 모바일 QA + Vercel 배포.
