import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

// next/font: 빌드 시 폰트를 자체 호스팅하고 CSS 변수(--font-fraunces)로 노출.
// globals.css의 --font-display 가 이 변수를 가리킨다.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "우리 결혼합니다",
  description: "인혁 & ○○ 결혼식에 초대합니다 · 2026.12.13",
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
