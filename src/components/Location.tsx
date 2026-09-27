"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Section from "./Section";
import { copyText } from "@/lib/clipboard";
import type { LocationData } from "@/types";

type KakaoLatLng = { getLat(): number; getLng(): number };
type KakaoMap = {
  setDraggable(draggable: boolean): void;
  setZoomable(zoomable: boolean): void;
};
type KakaoMarker = unknown;
type KakaoGeocodeResult = { x: string; y: string };
type KakaoGeocoderStatus = "OK" | "ZERO_RESULT" | "ERROR";

declare global {
  interface Window {
    kakao: {
      maps: {
        load(callback: () => void): void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (
          container: HTMLElement,
          options: { center: KakaoLatLng; level: number }
        ) => KakaoMap;
        Marker: new (options: { position: KakaoLatLng; map: KakaoMap }) => KakaoMarker;
        services: {
          Geocoder: new () => {
            addressSearch(
              address: string,
              callback: (result: KakaoGeocodeResult[], status: KakaoGeocoderStatus) => void
            ): void;
          };
          Status: { OK: KakaoGeocoderStatus };
        };
      };
    };
  }
}

type Coords = { lat: number; lng: number };

// SDK 가 이 시간 안에 좌표를 못 주면 지도를 포기하고 안내 문구를 띄운다
// (광고 차단기, 네트워크 차단 등으로 스크립트가 영영 안 오는 경우 대비)
const MAP_TIMEOUT_MS = 8000;

const TMAP_STORE = {
  ios: "https://apps.apple.com/kr/app/id431589174",
  android: "https://play.google.com/store/apps/details?id=com.skt.tmap.ku",
};

// config 문구 안의 **...** 를 굵게 렌더링.
// 마크다운 파서를 붙이기엔 과하고 필요한 건 강조 하나뿐이라 최소한만 처리한다.
// split 에 캡처 그룹을 쓰면 구분자(**...**)도 결과 배열에 남는다.
function Emphasized({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

// 오시는 길 (카카오맵). 주소 → 좌표는 카카오 Geocoder로 그때그때 변환.
// SDK/지오코딩은 이 섹션에서만 필요하므로 지연 로드.
export default function Location({ data }: { data: LocationData }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const coordsRef = useRef<Coords | null>(null);

  // SDK 스크립트가 로드되면(Script onLoad) 주소 → 좌표 변환
  function onSdkLoad() {
    try {
      window.kakao.maps.load(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(data.address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const c = { lat: Number(result[0].y), lng: Number(result[0].x) };
            coordsRef.current = c;
            setCoords(c);
          } else {
            setMapFailed(true);
          }
        });
      });
    } catch {
      setMapFailed(true);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!coordsRef.current) setMapFailed(true);
    }, MAP_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!coords || !mapRef.current) return;
    const center = new window.kakao.maps.LatLng(coords.lat, coords.lng);
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 3 });
    // 페이지를 스크롤하다 지도에 손가락이 닿으면 지도만 움직여 스크롤이 막힌다.
    // 위치 확인용 고정 지도로 두고, 길찾기는 아래 지도 앱 버튼으로 넘긴다
    map.setDraggable(false);
    map.setZoomable(false);
    new window.kakao.maps.Marker({ position: center, map });
  }, [coords]);

  async function copyAddress() {
    const ok = await copyText(data.address);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), ok ? 1500 : 4000);
  }

  // 티맵이 안 깔린 폰에서는 tmap:// 링크가 아무 반응이 없다(iOS 는 오류 창).
  // 1.5초 뒤에도 페이지가 그대로 보이면 앱이 안 열린 것으로 보고 스토어로 보낸다
  function openTmap(e: React.MouseEvent) {
    e.preventDefault();
    window.location.href = tmapLink;
    setTimeout(() => {
      if (document.hidden) return;
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      window.location.href = isIOS ? TMAP_STORE.ios : TMAP_STORE.android;
    }, 1500);
  }

  const query = encodeURIComponent(data.address);
  const kakaoLink = `https://map.kakao.com/link/search/${query}`;
  const naverLink = `https://map.naver.com/p/search/${query}`;
  const tmapLink = coords
    ? `tmap://route?goalname=${encodeURIComponent(data.name)}&goalx=${coords.lng}&goaly=${coords.lat}`
    : `tmap://search?name=${query}`;

  const linkBase =
    "flex min-h-11 items-center justify-center rounded-lg border border-hairline text-center font-body text-sm text-body";

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={onSdkLoad}
        onError={() => setMapFailed(true)}
      />
      <Section eyebrow="Location" className="bg-canvas text-center">
        <div className="mx-auto max-w-xs">
          <h2 className="font-display text-xl text-ink">오시는 길</h2>
          <p className="mt-1 font-body text-sm text-muted">
            {data.name} · {data.hallText}
          </p>

          <div
            ref={mapRef}
            className="mt-6 h-56 w-full overflow-hidden rounded-2xl border border-hairline bg-white"
          >
            {mapFailed && !coords && (
              <div className="flex h-full items-center justify-center px-6 font-body text-sm leading-relaxed text-muted">
                지도를 불러오지 못했습니다.
                <br />
                아래 지도 앱 버튼으로 확인해 주세요.
              </div>
            )}
          </div>

          <p className="selectable mt-4 font-body text-base text-body">{data.address}</p>

          <button
            onClick={copyAddress}
            className="mt-3 min-h-11 rounded-md border border-hairline px-5 font-body text-sm text-body"
          >
            {copyState === "copied" ? "복사됨" : "주소 복사"}
          </button>
          {copyState === "failed" && (
            <p className="mt-1.5 font-body text-sm text-danger" role="status">
              복사가 안 되는 환경이에요. 주소를 길게 눌러 복사해 주세요.
            </p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={kakaoLink} target="_blank" rel="noopener noreferrer" className={linkBase}>
              카카오맵
            </a>
            <a href={naverLink} target="_blank" rel="noopener noreferrer" className={linkBase}>
              네이버지도
            </a>
            <a href={tmapLink} onClick={openTmap} className={linkBase}>
              티맵
            </a>
          </div>

          {/* 교통 안내 — 접지 않고 전부 펼쳐 둔다.
              어르신 하객이 탭해서 여는 UI를 놓치는 경우가 많다 */}
          {data.transport.length > 0 && (
            <div className="mt-10 space-y-6 text-left">
              {data.transport.map((t) => (
                <div key={t.label}>
                  <p className="font-body text-sm font-semibold tracking-wide text-accent-ink">
                    {t.label}
                  </p>
                  <div className="mt-2 space-y-1">
                    {t.lines.map((line, i) => (
                      <p
                        key={i}
                        className="font-body text-sm leading-relaxed text-body"
                      >
                        <Emphasized text={line} />
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
