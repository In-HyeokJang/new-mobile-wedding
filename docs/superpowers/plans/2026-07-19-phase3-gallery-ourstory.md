# Phase 3: Gallery + Our Story Implementation Plan

> 인라인 실행. 각 태스크 끝에 검증·커밋.

**Goal:** 흑백 사진 갤러리(그리드 + 라이트박스/스와이프)와 인터뷰(Our Story) 섹션을 추가한다.

**Architecture:** Gallery는 탭하면 전체화면 라이트박스가 열리고 좌우 이동/스와이프 → 클라이언트 컴포넌트. Our Story는 정적 Q&A → 서버 컴포넌트. 둘 다 props 주입.

**Tech Stack:** Next.js 16, React 19(useState/useEffect, 터치 이벤트), next/image, Tailwind v4.

## Global Constraints
- Phase 1~2 토큰/폰트/props 주입/dev 브랜치/무료 리소스 동일.
- 갤러리 사진은 흑백(`grayscale`) 표시.

---

## 파일 구조 (Phase 3)
```
public/images/gallery-1..6.jpg   # 임시 플레이스홀더
src/
├── types.ts          # GalleryData, QA, OurStoryData 추가
├── config.ts         # gallery, ourStory 데이터
├── components/
│   ├── Gallery.tsx    # 그리드 + 라이트박스 (client)
│   └── OurStory.tsx   # 인터뷰 Q&A (server)
└── app/page.tsx       # ... → Gallery → OurStory
```

---

### Task 8: 타입 & config & 임시 이미지

**Interfaces produced:**
- `GalleryData { photos: string[] }`
- `QA { q: string; a: string }`
- `OurStoryData { title?: string; qa: QA[] }`
- `config.gallery`, `config.ourStory`

- [ ] **Step 1: types.ts 추가**
```ts
export type GalleryData = { photos: string[] };
export type QA = { q: string; a: string };
export type OurStoryData = { title?: string; qa: QA[] };
```
`InvitationConfig`에 `gallery: GalleryData; ourStory: OurStoryData;` 추가.

- [ ] **Step 2: config.ts 추가**
```ts
gallery: {
  photos: [
    "/images/gallery-1.jpg", "/images/gallery-2.jpg", "/images/gallery-3.jpg",
    "/images/gallery-4.jpg", "/images/gallery-5.jpg", "/images/gallery-6.jpg",
  ],
},
ourStory: {
  title: "우리 두 사람의 이야기",
  qa: [
    { q: "처음 만난 순간은?", a: "친구 소개로 만나 첫 대화부터 밤새 이야기를 나눴어요." },
    { q: "서로의 첫인상은?", a: "따뜻하게 웃는 모습이 오래 기억에 남았습니다." },
    { q: "프러포즈는 어땠나요?", a: "둘이 처음 걸었던 그 거리에서, 조용히." },
  ],
},
```

- [ ] **Step 3: 임시 갤러리 이미지 6장 생성** (System.Drawing, 각 다른 톤)
- [ ] **Step 4: 검증** `npx tsc --noEmit`
- [ ] **Step 5: Commit** `feat: gallery/ourStory 타입+config+임시이미지`

---

### Task 9: Gallery 섹션 (그리드 + 라이트박스)

**Files:** Create `src/components/Gallery.tsx`; Modify `src/app/page.tsx`

**개념:** 라이트박스 열림 상태를 `useState<number|null>`(열린 사진 인덱스). 열렸을 때 `useEffect`로 body 스크롤 잠그고 키보드(←/→/Esc) 처리. 모바일 스와이프는 onTouchStart/onTouchEnd의 x 변화로 판정.

- [ ] **Step 1: Gallery.tsx 작성**
```tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Section from "./Section";
import type { GalleryData } from "@/types";

export default function Gallery({ data }: { data: GalleryData }) {
  const photos = data.photos;
  const [open, setOpen] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () => setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  return (
    <Section eyebrow="Gallery" className="bg-canvas">
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className="relative aspect-square overflow-hidden"
            aria-label={`사진 ${i + 1} 크게 보기`}
          >
            <Image src={src} alt={`gallery ${i + 1}`} fill sizes="33vw" className="object-cover grayscale" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (dx > 50) prev();
            else if (dx < -50) next();
            setTouchX(null);
          }}
        >
          <div className="relative h-[80vh] w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[open]} alt={`gallery ${open + 1}`} fill sizes="100vw" className="object-contain grayscale" />
          </div>
          <button onClick={close} className="absolute right-4 top-4 text-2xl text-white" aria-label="닫기">✕</button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-3 text-3xl text-white/80" aria-label="이전">‹</button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-3xl text-white/80" aria-label="다음">›</button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-body text-sm text-white/70">{open + 1} / {photos.length}</p>
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 2: page.tsx에 Gallery 추가** (Calendar 아래)
- [ ] **Step 3: 검증** dev 200 + "Gallery" + 그리드 6장. 라이트박스는 브라우저 클릭 확인.
- [ ] **Step 4: Commit** `feat: Gallery 섹션(그리드+라이트박스+스와이프)`

---

### Task 10: Our Story 섹션 (인터뷰)

**Files:** Create `src/components/OurStory.tsx`; Modify `src/app/page.tsx`

- [ ] **Step 1: OurStory.tsx (server)**
```tsx
import Section from "./Section";
import type { OurStoryData } from "@/types";

export default function OurStory({ data }: { data: OurStoryData }) {
  return (
    <Section eyebrow="Our Story" className="bg-canvas">
      <div className="mx-auto max-w-md">
        {data.title && (
          <h2 className="mb-10 text-center font-display text-2xl text-ink">{data.title}</h2>
        )}
        <ul className="space-y-8">
          {data.qa.map((item, i) => (
            <li key={i} className="border-b border-hairline pb-6 last:border-0">
              <p className="font-body text-sm font-semibold text-accent">Q. {item.q}</p>
              <p className="mt-2 font-body leading-relaxed text-body">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: page.tsx에 OurStory 추가** (Gallery 아래)
- [ ] **Step 3: 검증** dev 200 + "Our Story" + Q&A.
- [ ] **Step 4: 빌드** `npm run build` 성공.
- [ ] **Step 5: Commit & Push** `feat: Our Story 섹션` → `git push origin dev`

---

## Self-Review
- Spec coverage: Gallery(§6-4), OurStory(§6-5) 태스크 존재.
- Placeholder: 갤러리 이미지/인터뷰 문구는 실제값 대기(의도적).
- Type 일관성: `GalleryData.photos`, `OurStoryData.qa/title`, `QA.q/a` 정의(Task8) ↔ 사용(Task9/10) 일치.
