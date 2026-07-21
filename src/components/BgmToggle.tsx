"use client";

import { useEffect, useRef, useState } from "react";
import type { BgmData, Theme } from "@/types";

// 전역 배경음악 토글. 우하단 고정 버튼. 모바일 자동재생 정책 때문에
// 소리 자동재생은 막히므로, 첫 사용자 상호작용(버튼 탭/화면 탭)에서 재생 시도.
export default function BgmToggle({
  data,
  theme,
}: {
  data: BgmData;
  theme: Theme;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false)); // 파일 없음/정책 차단 시 조용히 무시
    }
  }

  // 첫 화면 탭 시 한 번 자동 재생 시도(음소거 아님이라 사용자 제스처 필요).
  useEffect(() => {
    function tryPlayOnce() {
      const audio = audioRef.current;
      if (!audio || playing) return;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
    window.addEventListener("pointerdown", tryPlayOnce, { once: true });
    return () => window.removeEventListener("pointerdown", tryPlayOnce);
  }, [playing]);

  return (
    <>
      <audio ref={audioRef} src={data.src} loop preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? "음악 끄기" : "음악 켜기"}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white/90 shadow-sm backdrop-blur"
        style={{ color: theme.accent }}
      >
        {/* 재생 중이면 회전하는 음표(진하게), 꺼짐이면 흐리게 */}
        <span
          className={`text-lg ${playing ? "animate-spin-slow" : "opacity-40"}`}
          aria-hidden
        >
          ♪
        </span>
      </button>
      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </>
  );
}
