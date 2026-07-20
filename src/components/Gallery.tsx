"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Section from "./Section";
import type { GalleryData } from "@/types";

// 흑백 사진 그리드 + 탭하면 전체화면 라이트박스(좌우 이동/스와이프).
export default function Gallery({ data }: { data: GalleryData }) {
  const photos = data.photos;
  const [open, setOpen] = useState<number | null>(null); // 열린 사진 인덱스 (null=닫힘)
  const [touchX, setTouchX] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () =>
      setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  // 라이트박스 열렸을 때: 스크롤 잠금 + 키보드 조작. 닫히면 정리.
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
            <Image
              src={src}
              alt={`gallery ${i + 1}`}
              fill
              sizes="33vw"
              className="object-cover grayscale transition-transform duration-300 hover:scale-105"
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
              className="object-contain grayscale"
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
