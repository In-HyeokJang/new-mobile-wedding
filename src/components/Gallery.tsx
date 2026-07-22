"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Section from "./Section";
import type { GalleryData } from "@/types";

// 사진 그리드 + 탭하면 전체화면 라이트박스(좌우 이동/스와이프).
export default function Gallery({ data }: { data: GalleryData }) {
  const photos = data.photos;
  const [open, setOpen] = useState<number | null>(null); // 열린 사진 인덱스 (null=닫힘)
  const [touchX, setTouchX] = useState<number | null>(null);

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
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, prev, next]);

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
            <Image
              src={src}
              alt={`gallery ${i + 1}`}
              fill
              sizes="33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
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
          <div
            className="relative h-[80vh] w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[open]}
              alt={`gallery ${open + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button
            onClick={close}
            className="absolute right-4 top-4 text-2xl text-white"
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
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-body text-sm text-white/70">
            {open + 1} / {photos.length}
          </p>
        </div>
      )}
    </Section>
  );
}
