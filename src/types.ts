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

// 혼주(양가 부모) 한 줄. 부모 성함 + "의 아들/딸 신랑/신부명".
export type ParentLine = {
  fatherName?: string;
  motherName?: string;
  childRelation: string; // "아들" | "딸"
  childName: string;
};

export type InvitationData = {
  greeting: string[]; // 인사말 문단(줄 단위)
  groom: ParentLine;
  bride: ParentLine;
};

export type CalendarData = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23, 예식 정확한 시각 (실시간 카운트다운 계산용)
  minute: number; // 0-59
  timeText: string; // 예: "오후 1시 30분"
};

export type GalleryData = { photos: string[] };

// 오시는 길 (카카오맵). 좌표는 address를 카카오 Geocoder로 변환해 얻으므로 별도 저장 불필요.
export type LocationData = {
  name: string; // 건물명 (지도 검색/마커 기준)
  hallText: string; // 홀 상세 (예: "제니스홀 5층")
  address: string; // 도로명 주소 (지오코딩 + 표시 + 복사용)
};

export type QA = { q: string; a: string };
export type OurStoryData = { title?: string; qa: QA[] };

// 방명록
export type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};
export type GuestbookInput = { name: string; pin: string; message: string };

// 공유(카톡/OG). 링크 미리보기 썸네일·제목·설명.
export type ShareData = {
  title: string;
  description: string;
  ogImage: string; // 예: "/og-image.jpg"
  siteUrl: string; // 배포 도메인 (OG 절대경로 기준)
};

// 배경음악
export type BgmData = {
  src: string; // 예: "/music/bgm.mp3"
};

export type InvitationConfig = {
  theme: Theme;
  intro: IntroData;
  invitation: InvitationData;
  calendar: CalendarData;
  location: LocationData;
  gallery: GalleryData;
  ourStory: OurStoryData;
  share: ShareData;
  bgm: BgmData;
};
