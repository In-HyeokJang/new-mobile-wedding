"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Section from "./Section";
import type { GalleryData } from "@/types";

// 처음에 보여줄 장수. 사진이 이보다 많으면 "더보기"로 접어 둔다 —
// 사진이 늘어날수록 갤러리 섹션만 한없이 길어져 뒤 섹션이 멀어지기 때문.
const INITIAL_COUNT = 6;

// 사진 그리드 + 탭하면 전체화면 라이트박스(좌우 이동/스와이프).
export default function Gallery({ data }: { data: GalleryData }) {
  const photos = data.photos;
  const [open, setOpen] = useState<number | null>(null); // 열린 사진 인덱스 (null=닫힘)
  const [touchX, setTouchX] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  // 그리드에만 적용되는 제한. 라이트박스는 항상 photos 전체를 넘나든다 →
  // 접힌 상태에서 6번째 사진을 열어도 7번째 이후까지 계속 넘겨볼 수 있다.
  const hasMore = photos.length > INITIAL_COUNT;
  const visible = expanded ? photos : photos.slice(0, INITIAL_COUNT);

  // 닫을 때는 직접 null을 넣지 않고 history.back()으로 되돌린다 — 열 때 쌓아둔
  // 히스토리를 여기서 되돌려 소비해야, 폰 "뒤로가기"로 닫았을 때와 동작이
  // 같아지고 히스토리에 유령 항목이 남지 않는다.
  const close = useCallback(() => window.history.back(), []);
  const prev = useCallback(
    () =>
      setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  const isOpen = open !== null;

  // 라이트박스 열렸을 때: 스크롤 잠금 + 키보드 조작 + 히스토리 항목 추가.
  // isOpen(불리언)에만 의존 — open(사진 인덱스)에 의존하면 사진 넘길 때마다
  // 히스토리가 계속 쌓여 뒤로가기를 여러 번 눌러야 하는 문제가 생긴다.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    window.history.pushState({ lightbox: true }, "");
    const onPopState = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    // iOS Safari 는 touch-action 만으로는 핀치 줌이 새는 경우가 있어
    // 전용 gesture 이벤트까지 막는다 (라이트박스가 열려 있는 동안만).
    const blockGesture = (e: Event) => e.preventDefault();
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKey);
    document.addEventListener("gesturestart", blockGesture);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("gesturestart", blockGesture);
    };
  }, [isOpen, close, prev, next]);

  return (
    <Section eyebrow="Gallery" className="bg-canvas">
      <div className="grid grid-cols-3 gap-1.5">
        {visible.map((src, i) => (
          <button
            // 같은 파일을 두 번 넣어도 key 가 겹치지 않도록 인덱스를 붙인다
            key={`${src}-${i}`}
            onClick={() => setOpen(i)}
            className="relative aspect-square overflow-hidden"
            aria-label={`사진 ${i + 1} 크게 보기`}
          >
            {/* 버튼에 aria-label 이 있으니 썸네일은 alt 를 비워 두 번 읽히지 않게 */}
            <Image
              src={src}
              alt=""
              fill
              // 본문이 430px 컬럼이라 PC 에서 33vw 면 셀(약 140px)보다 훨씬 큰 원본을 받는다
              sizes="(max-width: 430px) 33vw, 140px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mx-auto mt-5 flex items-center gap-1.5 rounded-full bg-accent/10 px-5 py-2 font-body text-sm text-body"
        >
          {expanded
            ? "접기"
            : `사진 더보기 (${photos.length - INITIAL_COUNT}장)`}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`h-4 w-4 text-muted transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="사진 크게 보기"
          // touch-none: 확대된 사진을 손가락으로 더 키우는 핀치/더블탭 줌 차단.
          // 스와이프는 터치 이벤트로 직접 계산하니 영향 없다.
          className="fixed inset-0 z-50 flex touch-none items-center justify-center bg-black/90"
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
          <div
            // h-lightbox = 80dvh (구형 브라우저는 80vh). vh 는 iOS 주소창에 가려진다
            className="h-lightbox relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[open]}
              alt={`웨딩 사진 ${open + 1} / ${photos.length}`}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-contain"
            />
          </div>

          <button
            onClick={close}
            className="absolute right-2 flex h-12 w-12 items-center justify-center text-2xl text-white"
            // 노치/다이내믹 아일랜드 아래로
            style={{ top: "calc(0.5rem + env(safe-area-inset-top))" }}
            aria-label="닫기"
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-3 text-3xl text-white/80"
            aria-label="이전 사진"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-3xl text-white/80"
            aria-label="다음 사진"
          >
            ›
          </button>
          <p
            className="absolute left-1/2 -translate-x-1/2 font-body text-sm text-white/70"
            style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          >
            {open + 1} / {photos.length}
          </p>
        </div>
      )}
    </Section>
  );
}
