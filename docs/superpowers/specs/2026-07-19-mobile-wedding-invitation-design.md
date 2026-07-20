# 모바일 청첩장 설계 (v1) — 빌더 확장 대비

- **작성일**: 2026-07-19
- **상태**: 설계 확정 대기 (사용자 리뷰 중)
- **예식일**: 2026-12-13(일) 13:30 · **링크 배포 목표**: 예식 8주 전 ≈ 2026-10-18

---

## 1. 개요 & 목표

실제 본인 결혼식에 사용할 모바일 청첩장을 직접 개발한다. 하객이 실제로 보는 **프로덕션**이므로 안정성·공유(카카오톡)·RSVP가 중요하다. 동시에 개발자 본인이 **Next.js/React를 배우는 것**과, 나중에 이 코드를 **여러 사람이 쓰는 청첩장 빌더(SaaS)로 확장**하는 것을 목표로 한다.

### 성공 기준
- 모바일에서 각 섹션이 매끄럽게 스크롤·동작한다.
- RSVP·방명록이 Supabase에 실제로 저장된다 (end-to-end 확인).
- 카카오톡 공유 시 썸네일(OG)과 문구가 정상 노출된다.
- 컴포넌트가 `props` 주입 구조라, 나중에 빌더가 데이터만 바꿔 끼우면 재사용된다.
- 전부 **무료** 리소스로 구성된다 (폰트/호스팅/DB 무료 티어).

### 범위 밖 (Out of Scope, v1)
- 빌더 위저드 UI (Step 1·3·11의 스타일 선택/세부조정/드래그 순서변경) — v2.
- 로그인/인증, 다중 청첩장 관리 — v2 (빌더 단계).
- 결제, 유료 기능.

---

## 2. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router) + TypeScript** | 학습 목표 + 빌더 확장 재사용 |
| 스타일 | **Tailwind CSS** | 디자인 토큰을 config로 관리, 빌더에서 테마 교체 용이 |
| DB/백엔드 | **Supabase (Postgres)** | RSVP·방명록 저장, 사용자 경험 보유, 무료 티어, 다중 청첩장 확장 자연스러움 |
| 배포 | **Vercel** | Next 최적화, 무료, 자동 HTTPS·OG |
| 지도 | **Kakao Map JS SDK** | 국내 표준 |
| 공유 | **Kakao JS SDK (공유)** | 카톡 공유 썸네일/버튼 |

### 학습 개념 메모 (진행하며 설명)
- **서버 컴포넌트(기본)**: 서버에서 렌더. 정적 콘텐츠(사진·텍스트·인사말)에 사용.
- **클라이언트 컴포넌트(`"use client"`)**: 상호작용 필요한 곳에만 — BGM 토글, 갤러리 스와이프, RSVP/방명록 폼.
- **API Route(`app/api/**/route.ts`)**: 폼 데이터를 Supabase로 보내는 서버 엔드포인트.

---

## 3. 디자인 시스템 (Claude 베이스 각색)

`getdesign add claude`로 프로젝트 루트에 설치한 `DESIGN.md`를 기준으로 하고, 사용자 토큰을 덮어쓴다.

### 컬러
| 토큰 | 값 | 용도 |
|---|---|---|
| `canvas` | `#faf9f5` (크림) | 페이지 배경 |
| `ink` | `#141413` | 제목 |
| `body` | `#3d3d3a` | 본문 |
| `muted` | `#6c6a64` | 보조 텍스트 |
| `hairline` | `#e6dfd8` | 구분선 |
| **`accent`** | **`#FF630F`** | **포인트 단 하나** (CTA, 강조, D-day 숫자 등). 사진·포인트 외 장식용 금지. |

### 타이포 (전부 무료)
- **디스플레이(라틴)**: **Fraunces** (Google Fonts) — 우아한 하이컨트라스트 세리프. 원래 원했던 Aujournuit 감성 대체. 신랑♥신부 이름, 대형 로크업.
- **본문(한글)**: **Pretendard** — 깔끔한 휴머니스트 산세리프. self-host 또는 CDN.
- Latin 디스플레이와 한글 본문을 분리 (Fraunces는 한글 미지원).

### 레이아웃 & 사진
- **사진**: 전부 **흑백(CSS `grayscale`) 풀블리드**, 텍스트는 **하단 정렬** 오버레이.
- 섹션은 세로 스크롤 챕터로 전개.
- **간격**: 8px 그리드.
- 크림 캔버스 + 흑백 사진 + 오렌지 포인트 = 웨딩 에디토리얼.

### 토큰 관리
- `tailwind.config.js` theme extend + `src/config.ts`의 `theme` 객체.
- 빌더 Step 1·3(스타일 선택)이 나중에 이 `theme` 값만 바꾸면 되도록 분리.

---

## 4. 빌더 확장 대비 핵심 원칙

- 컴포넌트는 **전역 `config`를 직접 import하지 않고 `props`로 값 주입**받는다.
  - 예: `<Intro data={config.intro} theme={config.theme} />`
- `src/config.ts`는 지금은 **내 청첩장 데이터 한 벌**이지만, 타입 `InvitationConfig`를 정의해두면 나중에 빌더가 DB에서 이 타입 객체를 만들어 주입 → **컴포넌트 코드는 변경 없음.**
- 이것이 "1개 → 빌더"를 저비용으로 만드는 설계 포인트.

### `InvitationConfig` 타입 스케치
```ts
type InvitationConfig = {
  theme: { canvas; ink; body; accent; ... };
  intro: { groom; bride; date; place; mainPhoto };
  invitation: { message; hosts: { groomSide; brideSide } };
  calendar: { date; time };
  gallery: { photos: string[] };
  ourStory: { qa: { q; a }[] };      // 인터뷰
  location: { name; address; lat; lng; guide; transport };
  account: { groomSide: Acc[]; brideSide: Acc[] };
  rsvp: { enabled: boolean };
  bgm: { src; autoplayHint };
  share: { title; description; ogImage };
};
```

---

## 5. 데이터 모델 (Supabase)

```
rsvp        (id, created_at, side ['신랑측'|'신부측'], name,
             attend bool, guest_count int, meal bool, phone?, message?)
guestbook   (id, created_at, name, password_hash, message)
```
- 방명록 삭제용 4자리 비밀번호는 **해시 저장**.
- v1은 단일 청첩장이라 `invitation_id` 불필요. 빌더 확장 시 각 테이블에 `invitation_id` FK 추가.

---

## 6. 섹션 컴포넌트 (스크롤 순서)

각 섹션 = `src/components/{Name}.tsx`, 독립 단위 (독립적으로 이해·교체 가능).

| 순서 | 컴포넌트 | 유형 | 내용 |
|---|---|---|---|
| 1 | `Intro` | server | 흑백 메인사진 풀블리드 + 신랑♥신부 + 예식일시 |
| 2 | `Invitation` | server | 인사말 + 혼주(양가 부모님) |
| 3 | `Calendar` | client(경량) | 달력 + D-day 카운터 |
| 4 | `Gallery` | client | 갤러리 (흑백, 풀레이아웃, 스와이프/라이트박스) |
| 5 | `OurStory` | server | 우리만의 이야기 (인터뷰 Q&A) |
| 6 | `Location` | client | 카카오 지도 + 길안내 + 앱 바로열기/주소복사 |
| 7 | `Account` | client(경량) | 마음 전하실 곳 (계좌, 접이식, 복사) |
| 8 | `RSVP` | client | 참석 의사 폼 → API Route → Supabase |
| — | `Guestbook` | client | 방명록 (목록 + 작성 + 비번 삭제) → Supabase |
| 전역 | `BgmToggle` | client | 우하단 재생/음소거 토글 (모바일 자동재생 제약 대응) |
| 전역 | `ShareBar` / `layout metadata` | client + meta | 카톡 공유 버튼 + OG 썸네일 |

### 폴더 구조
```
my-wedding/
├── public/{images, music, og-image.jpg}
├── DESIGN.md                     # Claude 디자인 레퍼런스
├── src/
│   ├── config.ts                 # InvitationConfig 데이터 한 벌
│   ├── types.ts                  # InvitationConfig 타입
│   ├── lib/supabase.ts           # Supabase 클라이언트
│   ├── components/{Intro,Invitation,Calendar,Gallery,OurStory,
│   │                Location,Account,RSVP,Guestbook,BgmToggle,ShareBar}.tsx
│   └── app/
│       ├── layout.tsx            # 폰트, 전역 스타일, 메타데이터(OG)
│       ├── page.tsx              # 섹션 배치(순서)
│       └── api/{rsvp,guestbook}/route.ts
└── tailwind.config.js
```

---

## 7. 외부 서비스 & 필요 키 (진행하며 함께 발급)

- **Supabase** 프로젝트: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Kakao Developers** 앱 키: JavaScript 키 (지도 + 공유). 도메인 등록 필요.
- 폰트(Fraunces/Pretendard): 무료, self-host 또는 Google Fonts.
- `.env.local`로 키 관리, `.gitignore` 처리.

---

## 8. 단계별 진행 계획 (학습 흐름)

1. Next.js 프로젝트 생성 + Tailwind + 디자인 토큰 세팅 (구조·개념 학습)
2. `types.ts`(InvitationConfig) 설계 + `config.ts`에 내 데이터 채우기
3. 정적 섹션 (Intro → Invitation → OurStory → Gallery) 서버 컴포넌트로
4. 상호작용 섹션 (Calendar D-day, Gallery 스와이프, Account, BGM)
5. Supabase 연결 + RSVP + Guestbook (API Route)
6. Location (카카오 지도/길찾기) + Share (카톡/OG)
7. 실제 콘텐츠·사진 흑백 처리 + 모바일 QA → Vercel 배포

---

## 9. 검증

- **실제 폰 기준** 모바일 뷰포트에서 각 섹션 QA.
- RSVP/방명록: Supabase 대시보드에서 실제 저장 확인 (end-to-end).
- 카톡 공유: 실제 카톡으로 링크 보내 썸네일/문구 확인.
- 배포 후 여러 기기(iOS Safari / Android Chrome)에서 자동재생·지도·폰트 로딩 확인.

---

## 10. 미결 항목 (진행 중 확정)

- Kakao Developers 앱 키 발급 (사용자 계정).
- 실제 콘텐츠: 인사말 문구, 혼주 정보, 계좌번호, 인터뷰 Q&A, 사진 원본.
- BGM 음원 (저작권 프리 트랙).
- 예식장 정확한 좌표/주소/교통 안내.
