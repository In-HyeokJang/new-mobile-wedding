import type { Metadata, Viewport } from "next";
import { Gowun_Dodum } from "next/font/google";
import ContentGuard from "@/components/ContentGuard";
import { config } from "@/config";
import "./globals.css";

// 모바일 기기(실기기) 접속 시 정확한 너비 인식.
// 확대(핀치 줌)는 막지 않는다 — 어르신 하객이 계좌번호·버스 번호·사진을 키워 본다.
// 입력창 포커스 때 iOS 자동 확대는 입력 글씨를 16px 로 둬서 막는다(Guestbook.tsx).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: config.theme.canvas,
};

// next/font: 빌드 시 폰트를 자체 호스팅하고 CSS 변수(--font-gowun-dodum)로 노출.
// globals.css의 --font-display 가 이 변수를 가리킨다.
//
// preload:false 인 이유 — 한글 폰트는 글리프가 많아 Google 이 unicode-range 로
// 100여 개 조각으로 쪼개 준다. preload 를 켜면 그 조각 전부가 <head> 에
// preload 링크로 박혀 초기 로딩이 오히려 느려진다. swap 으로 두면 브라우저가
// 실제 쓰인 글자가 들어있는 조각만 골라 받는다.
const gowunDodum = Gowun_Dodum({
  weight: "400",
  variable: "--font-gowun-dodum",
  display: "swap",
  preload: false,
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
    // 실제 파일 크기와 맞춰야 카톡 미리보기가 잘리지 않는다 (1200×630 권장 비율).
    // 이미지를 바꾸면 이 값도 맞추고, 파일명을 바꾸거나 카카오 캐시를 초기화한다
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
    <html lang="ko" className={`${gowunDodum.variable} h-full antialiased`}>
      <head>
        {/* 한글 본문 폰트 Pretendard (React가 head로 hoist).
            preconnect 로 CDN 연결을 미리 열어 폰트가 늦게 바뀌는 깜빡임을 줄인다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* 등장 애니메이션 스위치. 이 스크립트가 실행돼야만 .reveal 이 숨겨진다
            (globals.css 의 .js .reveal). 스크립트가 막히면 애니메이션만 없고
            내용은 정상적으로 다 보인다. 첫 페인트 전에 실행돼야 깜빡임이 없다 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="min-h-full">
        <ContentGuard />
        {children}
      </body>
    </html>
  );
}
