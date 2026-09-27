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
  // 폰 화면에 꽉 채우면 좌우가 잘린다. 사진의 어느 지점을 가운데에 둘지 (CSS object-position).
  // 예: "60% center" = 가로 60% 지점 기준. 없으면 정가운데.
  mainPhotoPosition?: string;
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
  durationMinutes: number; // 캘린더 저장 시 일정 길이 (예식 + 식사)
};

export type GalleryData = { photos: string[] };

// 교통 안내 한 묶음 (대중교통 / 자가용 / 주차).
// 항목 수를 고정하지 않고 배열로 둬서 예식장마다 필요한 만큼만 넣을 수 있게 한다.
export type TransportInfo = {
  label: string; // 예: "대중교통 이용 시"
  lines: string[]; // 안내 문구 (줄 단위)
  // true 면 제목 버튼만 보이고 눌러야 펼쳐진다 (지하철/버스처럼 긴 안내용).
  // 주차·식사처럼 모두가 봐야 하는 안내는 비워 두면 항상 펼쳐져 있다.
  collapsible?: boolean;
};

// 오시는 길 (카카오맵). 좌표는 address를 카카오 Geocoder로 변환해 얻으므로 별도 저장 불필요.
export type LocationData = {
  name: string; // 건물명 (지도 검색/마커 기준)
  hallText: string; // 홀 상세 (예: "제니스홀 5층")
  address: string; // 도로명 주소 (지오코딩 + 표시 + 복사용)
  transport: TransportInfo[];
};

// 마음 전하실 곳 — 계좌 한 줄.
export type AccountEntry = {
  relation: string; // 예: "신랑", "아버지", "어머니"
  name: string;
  bank: string;
  number: string;
};

// 신랑측 / 신부측 묶음.
export type AccountSide = {
  label: string; // "신랑측" | "신부측"
  accounts: AccountEntry[];
};

export type AccountData = {
  note?: string; // 상단 안내 문구
  sides: AccountSide[];
};

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

// 맺음말 + 공유 버튼 (페이지 맨 끝)
export type ClosingData = {
  lines: string[]; // 감사 인사 (줄 단위)
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
  gallery: GalleryData;
  location: LocationData;
  account: AccountData;
  closing: ClosingData;
  share: ShareData;
  bgm: BgmData;
};
