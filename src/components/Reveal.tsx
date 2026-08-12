"use client";

import { useEffect, useRef, useState } from "react";

// 스크롤해서 화면에 들어오면 살짝 아래에서 올라오며 나타나는 래퍼.
//
// 보이고/숨기는 실제 스타일은 globals.css 의 .reveal 규칙이 갖고 있다.
// 여기서는 data-shown 만 바꾼다 — 기본값을 "보임"으로 두고 JS 가 살아있을 때만
// 숨기는 구조라, 스크립트가 막혀도 페이지가 백지가 되지 않는다.
//
// CSS 만으로 되는 animation-timeline: view() 는 아직 사파리/파이어폭스 지원이
// 고르지 않아, 하객 기기를 가릴 수 없는 청첩장에는 쓰지 않는다.
export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          // 한 번 나타나면 끝. 스크롤을 올릴 때마다 다시 사라지면 산만하다
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="reveal"
      data-shown={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
