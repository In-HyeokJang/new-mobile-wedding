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
    brideName: "박재은",
    dateText: "2026년 12월 13일 일요일 오후 1시 30분",
    placeText: "더뉴컨벤션 웨딩홀 5층 제니스홀",
    mainPhoto: "/images/main.jpg", // TODO: 실제 메인 사진으로 교체
  },
  invitation: {
    greeting: [
      "서로가 마주 보며 다져온 사랑을",
      "이제 함께 한 곳을 바라보며",
      "걸어갈 수 있는 큰 사랑으로 키우려 합니다.",
      "저희 두 사람의 시작을 축복해 주세요.",
    ],
    groom: { fatherName: "장면섭", motherName: "김선숙", childRelation: "아들", childName: "인혁" },
    bride: { fatherName: "박민규", motherName: "정정아", childRelation: "딸", childName: "재은" },
  },
  calendar: {
    year: 2026,
    month: 12,
    day: 13,
    hour: 13,
    minute: 30,
    timeText: "오후 1시 30분",
    // 캘린더에 저장할 일정 길이 — 예식 13:30 ~ 식사 종료 15:00
    durationMinutes: 90,
  },
  location: {
    name: "더뉴컨벤션 웨딩홀",
    hallText: "5층 제니스홀",
    address: "서울특별시 강서구 공항대로36길 57",
    // 버스 노선은 예식장 공식 홈페이지(thenewwed.kr/Location) 기준.
    // 주차는 공식 페이지에 안내가 없어 웨딩 정보 사이트들을 교차 확인한 값 →
    // TODO: 예식 전 예식장에 전화(1661-3303)로 무료 시간/이대서울병원 이용 가능 여부 재확인
    transport: [
      // **...** 로 감싼 부분은 굵게 표시된다 (Location.tsx 의 Emphasized).
      {
        label: "지하철 이용 시",
        lines: ["5호선 **발산역 7번 출구**, 도보 3분"],
      },
      {
        label: "버스 이용 시",
        lines: [
          "모두 **발산역** 정류장에서 내리시면 됩니다.",
          "간선(파랑) 601, 605, 654, 661",
          "지선(초록) 6630, 6632, 6633, 6645, 6648, 6712",
          "광역 3000, 3000-1 · 경기 60, 60-3",
          "공항 6003 · 마을 강서05, 강서06",
        ],
      },
      {
        label: "자가용 이용 시",
        lines: [
          "내비게이션에 **더뉴컨벤션 웨딩홀** 또는 **공항대로36길 57**을 검색해 주세요.",
        ],
      },
      {
        label: "주차 안내",
        lines: [
          "건물 지하 주차장 이용 · **2시간 무료**",
          "주차 등록은 **1층 엘리베이터 앞**에서 해주세요.",
          "만차 시 길 건너 **이대서울병원** 주차장을 이용하실 수 있습니다.",
        ],
      },
      {
        // TODO: 연회장 층수(4층 또는 3층)는 예식 1주일 전 예식장 안내 후 "**아래층**" 자리에 반영
        label: "식사 안내",
        lines: [
          "연회장은 예식홀 **아래층**에 마련되어 있습니다.",
          "예식 30분 전부터 2시간, **오후 1시 ~ 3시**까지 이용하실 수 있습니다.",
        ],
      },
      {
        label: "예식장 문의",
        lines: ["더뉴컨벤션 웨딩홀 **1661-3303**"],
      },
    ],
  },
  gallery: {
    // TODO: 실제 사진으로 교체 (public/images/gallery-*.jpg)
    photos: [
      "/images/gallery-1.jpg",
      "/images/gallery-2.jpg",
      "/images/gallery-3.jpg",
      "/images/gallery-4.jpg",
      "/images/gallery-5.jpg",
      "/images/gallery-6.jpg",
    ],
  },
  // 마음 전하실 곳.
  // TODO: 실제 은행/계좌번호로 교체. 넣지 않을 분은 배열에서 빼면 그대로 사라진다.
  account: {
    note: "참석이 어려우신 분들을 위해 계좌를 안내드립니다.",
    sides: [
      {
        label: "신랑측",
        tone: "groom",
        accounts: [
          { relation: "신랑", name: "장인혁", bank: "우리은행", number: "1002-265-571220" },
          { relation: "아버지", name: "장면섭", bank: "○○은행", number: "000-0000-0000" },
        ],
      },
      {
        label: "신부측",
        tone: "bride",
        accounts: [
          { relation: "신부", name: "박재은", bank: "○○은행", number: "000-0000-0000" },
          { relation: "아버지", name: "박민규", bank: "○○은행", number: "000-0000-0000" },
          { relation: "어머니", name: "정정아", bank: "○○은행", number: "000-0000-0000" },
        ],
      },
    ],
  },
  closing: {
    lines: [
      "저희 두 사람의 새로운 시작을",
      "함께 축복해 주셔서 감사합니다.",
    ],
  },
  share: {
    title: "인혁 ♥ 재은 결혼합니다",
    description: "2026년 12월 13일 일요일 오후 1시 30분 · 더뉴컨벤션 웨딩홀 5층 제니스홀",
    ogImage: "/og-image.jpg",
    siteUrl: "https://jihpjemobilewedding.vercel.app",
  },
  bgm: {
    src: "/music/bgm.mp3", // 저작권 프리 연주곡
  },
};
