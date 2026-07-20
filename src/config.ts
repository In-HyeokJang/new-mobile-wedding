import type { InvitationConfig } from "@/types";

// 내 청첩장 데이터 한 벌. (UI 코드와 분리 — 값만 여기서 바꾼다)
// TODO 표시는 "실제 값이 아직 미정"이라는 뜻 — 콘텐츠 확정되면 교체.
export const config: InvitationConfig = {
  theme: {
    canvas: "#faf9f5",
    ink: "#141413",
    body: "#3d3d3a",
    muted: "#6c6a64",
    hairline: "#e6dfd8",
    accent: "#ff630f",
  },
  intro: {
    groomName: "장인혁",
    brideName: "○○○", // TODO: 신부 이름
    dateText: "2026. 12. 13. SUN 1:30 PM",
    placeText: "○○웨딩홀 그랜드홀", // TODO: 예식장/홀
    mainPhoto: "/images/main.jpg", // TODO: 실제 메인 사진으로 교체
  },
};
