// 청첩장 데이터의 "계약서".
// 지금은 config.ts 한 벌이 채우지만, 나중에 빌더가 DB에서 같은 타입을 만들어 주입한다.
// → 컴포넌트는 이 타입만 알면 되고, 데이터 출처가 바뀌어도 코드는 그대로.

export type Theme = {
  canvas: string;
  ink: string;
  body: string;
  muted: string;
  hairline: string;
  accent: string;
};

export type IntroData = {
  groomName: string;
  brideName: string;
  dateText: string; // 예: "2026. 12. 13. SUN 1:30 PM"
  placeText: string; // 예: "○○웨딩홀 3F 그랜드홀"
  mainPhoto: string; // 예: "/images/main.jpg"
};

export type InvitationConfig = {
  theme: Theme;
  intro: IntroData;
  // Phase 2+ 에서 invitation, calendar, gallery ... 확장 예정
};
