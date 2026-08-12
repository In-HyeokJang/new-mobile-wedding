import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 서버를 휴대폰(같은 와이파이)에서 열 때 필요.
  // 이 목록에 없는 호스트로 들어오면 Next 가 /_next/* 개발 리소스를 막아서
  // 클라이언트 JS 가 통째로 안 돌고, 화면이 빈 채로 뜬다.
  // 배포(Vercel)에는 영향이 없다 — 개발 서버 전용 설정.
  allowedDevOrigins: ["204.218.7.28"],
};

export default nextConfig;
