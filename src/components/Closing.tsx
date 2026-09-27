"use client";

import { useState } from "react";
import Script from "next/script";
import Section from "./Section";
import { copyText } from "@/lib/clipboard";
import type { ClosingData, ShareData } from "@/types";

// 카카오 JavaScript SDK (공유 전용. 지도 SDK 의 window.kakao 와는 다른 window.Kakao).
// 버전/integrity 는 developers.kakao.com/docs/ko/javascript/download 기준 — 올릴 때 둘 다 바꾼다.
const KAKAO_SDK = {
  src: "https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js",
  integrity: "sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy",
};

type KakaoLink = { mobileWebUrl: string; webUrl: string };

declare global {
  interface Window {
    Kakao?: {
      init(key: string): void;
      isInitialized(): boolean;
      Share: {
        sendDefault(options: {
          objectType: "feed";
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: KakaoLink;
          };
          buttons: { title: string; link: KakaoLink }[];
        }): void;
      };
    };
  }
}

// 맺음말 + 공유 버튼. 페이지의 마지막 섹션.
// 카톡 공유는 지도와 같은 카카오 JavaScript 키를 쓴다(같은 앱, 도메인 등록도 공유).
export default function Closing({
  data,
  share,
  names,
}: {
  data: ClosingData;
  share: ShareData;
  names: [string, string];
}) {
  const [kakaoReady, setKakaoReady] = useState(false);
  const [notice, setNotice] = useState("");

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(""), 3000);
  }

  function initKakao() {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    const Kakao = window.Kakao;
    if (!Kakao || !key) return;
    try {
      if (!Kakao.isInitialized()) Kakao.init(key);
      setKakaoReady(Kakao.isInitialized());
    } catch {
      /* 키/도메인 문제 — 아래 폴백으로 공유 */
    }
  }

  async function copyLink() {
    const ok = await copyText(share.siteUrl);
    flash(ok ? "링크가 복사되었습니다." : `복사가 안 되는 환경이에요. ${share.siteUrl}`);
  }

  async function shareKakao() {
    if (kakaoReady && window.Kakao) {
      try {
        const link = { mobileWebUrl: share.siteUrl, webUrl: share.siteUrl };
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: share.title,
            description: share.description,
            imageUrl: new URL(share.ogImage, share.siteUrl).toString(),
            link,
          },
          buttons: [{ title: "청첩장 보기", link }],
        });
        return;
      } catch {
        /* 아래 폴백으로 */
      }
    }
    // SDK 가 막힌 환경: 기기 기본 공유 창 → 그것도 없으면 링크 복사
    if (navigator.share) {
      try {
        await navigator.share({ title: share.title, url: share.siteUrl });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // 사용자가 닫음
      }
    }
    await copyLink();
  }

  return (
    <>
      <Script
        src={KAKAO_SDK.src}
        integrity={KAKAO_SDK.integrity}
        crossOrigin="anonymous"
        strategy="lazyOnload"
        onLoad={initKakao}
      />
      {/* 하단 여백(pb-32)은 우하단 음악 버튼이 공유 버튼을 가리지 않게 하기 위함 */}
      <Section className="bg-canvas pb-32 text-center">
        <div className="mx-auto max-w-xs">
          <div className="mx-auto mb-10 h-px w-12 bg-hairline" />
          <div className="space-y-1.5 font-display text-lg leading-relaxed text-ink">
            {data.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p className="mt-6 font-body text-base text-muted">
            {names[0]} <span className="text-heart">❤</span> {names[1]} 드림
          </p>

          <div className="mt-10 space-y-2">
            <button
              onClick={shareKakao}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] font-body text-base text-[#191919]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 3.5c-5 0-9 3.1-9 7 0 2.5 1.7 4.7 4.2 6l-.9 3.4c-.1.3.3.6.6.4l4-2.6c.4 0 .7.1 1.1.1 5 0 9-3.1 9-7s-4-7.3-9-7.3z" />
              </svg>
              카카오톡으로 청첩장 전하기
            </button>
            <button
              onClick={copyLink}
              className="min-h-12 w-full rounded-md border border-hairline bg-white font-body text-base text-body"
            >
              청첩장 링크 복사
            </button>
          </div>
          <p className="mt-3 min-h-5 break-all font-body text-sm text-muted" role="status">
            {notice}
          </p>
        </div>
      </Section>
    </>
  );
}
