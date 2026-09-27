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
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  // 첫 화면 탭 시 자동 재생 시도(음소거 아님이라 사용자 제스처 필요).
  //
  // pointerdown 은 쓰지 않는다 — 터치의 pointerdown 은 브라우저가 "사용자 제스처"로
  // 쳐주지 않아 play() 가 거절된다. click / touchend 여야 한다.
  // 재생에 성공했을 때만 리스너를 뗀다(스크롤 터치 등으로 실패하면 다음 탭에 다시 시도).
  // 음악 버튼 자체를 누른 경우는 toggle 이 처리하므로 건너뛴다 — 안 그러면 여기서 켜고
  // toggle 이 바로 끄는 경합이 생긴다.
  // 마운트 시 한 번만 등록 — playing에 의존하면 끌 때마다 리스너가 재등록되어
  // 이후 아무 곳이나 탭해도 음악이 다시 켜지는 버그가 생김.
  useEffect(() => {
    const events = ["click", "touchend"] as const;
    function detach() {
      events.forEach((ev) => window.removeEventListener(ev, tryPlay));
    }
    function tryPlay(e: Event) {
      if (buttonRef.current?.contains(e.target as Node)) {
        detach(); // 사용자가 직접 켜고 끄기 시작했으니 자동 재생은 그만둔다
        return;
      }
      const audio = audioRef.current;
      if (!audio) return;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          detach();
        })
        .catch(() => {});
    }
    events.forEach((ev) => window.addEventListener(ev, tryPlay));
    return detach;
  }, []);

  // 카톡 채팅방으로 돌아가거나 다른 탭으로 가면 멈추고, 돌아오면 이어서 재생.
  useEffect(() => {
    let resumeOnReturn = false;
    function onVisibility() {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        resumeOnReturn = !audio.paused;
        audio.pause();
      } else if (resumeOnReturn) {
        audio.play().catch(() => setPlaying(false));
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <>
      <audio ref={audioRef} src={data.src} loop preload="none" />
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-label={playing ? "음악 끄기" : "음악 켜기"}
        className="fixed z-40 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white/90 shadow-sm backdrop-blur"
        style={{
          color: theme.accent,
          // 아이폰 홈 인디케이터 영역을 피한다
          bottom: "calc(1.25rem + env(safe-area-inset-bottom))",
          // PC 에서는 430px 본문 컬럼 안쪽 오른쪽에 붙인다(화면 끝에 떠 있지 않게)
          right: "max(1.25rem, calc((100vw - 430px) / 2 + 1.25rem))",
        }}
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
