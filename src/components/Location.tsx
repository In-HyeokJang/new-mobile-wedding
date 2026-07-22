"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Section from "./Section";
import type { LocationData } from "@/types";

type KakaoLatLng = { getLat(): number; getLng(): number };
type KakaoMap = unknown;
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

// 오시는 길 (카카오맵). 주소 → 좌표는 카카오 Geocoder로 그때그때 변환.
// SDK/지오코딩은 이 섹션에서만 필요하므로 지연 로드.
export default function Location({ data }: { data: LocationData }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sdkLoaded) return;
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(data.address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          setCoords({ lat: Number(result[0].y), lng: Number(result[0].x) });
        } else {
          setGeocodeFailed(true);
        }
      });
    });
  }, [sdkLoaded, data.address]);

  useEffect(() => {
    if (!coords || !mapRef.current) return;
    const center = new window.kakao.maps.LatLng(coords.lat, coords.lng);
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 3 });
    new window.kakao.maps.Marker({ position: center, map });
  }, [coords]);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(data.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 권한 없으면 조용히 무시 */
    }
  }

  const query = encodeURIComponent(data.address);
  const kakaoLink = `https://map.kakao.com/link/search/${query}`;
  const naverLink = `https://map.naver.com/p/search/${query}`;
  const tmapLink = coords
    ? `tmap://route?goalname=${encodeURIComponent(data.name)}&goalx=${coords.lng}&goaly=${coords.lat}`
    : `tmap://search?name=${query}`;

  const linkBase =
    "rounded-lg border border-hairline py-2 text-center font-body text-xs text-body";

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />
      <Section eyebrow="Location" className="bg-canvas text-center">
        <div className="mx-auto max-w-xs">
          <p className="font-display text-xl text-ink">오시는 길</p>
          <p className="mt-1 font-body text-sm text-muted">
            {data.name} · {data.hallText}
          </p>

          <div
            ref={mapRef}
            className="mt-6 h-56 w-full overflow-hidden rounded-2xl border border-hairline bg-white"
          >
            {geocodeFailed && (
              <div className="flex h-full items-center justify-center px-6 font-body text-xs text-muted">
                지도를 불러오지 못했습니다. 주소를 확인해 주세요.
              </div>
            )}
          </div>

          <p className="mt-4 font-body text-sm text-body">{data.address}</p>

          <button
            onClick={copyAddress}
            className="mt-3 rounded-md border border-hairline px-4 py-2 font-body text-sm text-body"
          >
            {copied ? "복사됨" : "주소 복사"}
          </button>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={kakaoLink} target="_blank" rel="noopener noreferrer" className={linkBase}>
              카카오맵
            </a>
            <a href={naverLink} target="_blank" rel="noopener noreferrer" className={linkBase}>
              네이버지도
            </a>
            <a href={tmapLink} className={linkBase}>
              티맵
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
