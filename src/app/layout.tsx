import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { config } from "@/config";
import "./globals.css";

// 모바일 기기(실기기) 접속 시 정확한 너비 인식 및 축소/확대 방지 메타데이터
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// next/font: 빌드 시 폰트를 자체 호스팅하고 CSS 변수(--font-fraunces)로 노출.
// globals.css의 --font-display 가 이 변수를 가리킨다.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// 공유 미리보기(카톡/OG)용 메타데이터. config.share 에서 값 주입.
// metadataBase: OG 이미지 경로를 절대 URL로 만들기 위한 기준 도메인.
const { share } = config;
export const metadata: Metadata = {
  metadataBase: new URL(share.siteUrl),
  title: share.title,
  description: share.description,
  openGraph: {
    title: share.title,
    description: share.description,
    url: share.siteUrl,
    siteName: share.title,
    images: [{ url: share.ogImage, width: 1200, height: 630 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: share.title,
    description: share.description,
    images: [share.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${fraunces.variable} h-full antialiased`}>
      <head>
        {/* 한글 본문 폰트 Pretendard (React가 head로 hoist) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
