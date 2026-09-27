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
    mainPhoto: "/images/main.jpg",
    // 두 사람이 사진 가로 50~75% 지점에 있어서 오른쪽으로 살짝 당긴다
    mainPhotoPosition: "60% center",
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
    // 지하철·버스·주소는 예식장 공식 홈페이지(thenewwed.kr/Location) 기준 (2026-09-27 대조).
    // 주차는 예식장에 직접 확인한 내용 (같은 건물·이대서울병원 모두 2시간 무료).
    transport: [
      {
        label: "지하철 이용 시",
        collapsible: true,
        lines: ["5호선 **발산역 7번 출구**, 도보 2분"],
      },
      {
        label: "버스 이용 시",
        collapsible: true,
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
        collapsible: true,
        lines: [
          "내비게이션에 **더뉴컨벤션** 또는 **공항대로36길 57**을 검색해 주세요.",
          "(지번: 내발산동 655-2)",
        ],
      },
      {
        label: "주차 안내",
        collapsible: true,
        lines: [
          "예식장 건물 주차장 · **2시간 무료**",
          "만차 시 예식장 옆 **이대서울병원** 주차장 · **2시간 무료**",
        ],
      },
    ],
  },
  gallery: {
    photos: [
      // 3열 그리드라 3장씩 한 줄. 처음 6장(2줄)만 보이고 나머지는 "더보기".
      // 둘째 줄 앞 두 칸의 12·13 풍선 사진은 나란히 두어야 "12월 13일"로 읽힌다.
      "/images/gallery-3.jpg", // 성당 앞 베일
      "/images/gallery-4.jpg", // 언덕 위 춤
      "/images/gallery-5.jpg", // 언덕에 앉아 손가락질
      "/images/gallery-6.jpg", // 풍선 12 (신부)
      "/images/gallery-7.jpg", // 풍선 13 (신랑)
      "/images/gallery-1.jpg", // 시장 구경 (메인 사진과 같은 컷)
      "/images/gallery-2.jpg", // 계단
      "/images/gallery-8.jpg", // 언덕 위 춤 (다른 컷)
      "/images/gallery-9.jpg", // 하늘 배경 베일
      "/images/gallery-10.jpg", // 안아 올리기 — 마지막 컷
    ],
  },
  account: {
    note: "참석이 어려우신 분들을 위해 계좌를 안내드립니다.",
    sides: [
      {
        label: "신랑측",
        accounts: [
          { relation: "신랑", name: "장인혁", bank: "우리은행", number: "1002-265-571220" },
          { relation: "아버지", name: "장면섭", bank: "농협은행", number: "243030-52-055353" },
        ],
      },
      {
        label: "신부측",
        accounts: [
          { relation: "신부", name: "박재은", bank: "신한은행", number: "110-430-448828" },
          { relation: "아버지", name: "박민규", bank: "농협은행", number: "356-0489-8581-63" },
          { relation: "어머니", name: "정정아", bank: "신한은행", number: "110-013-468768" },
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
    description: "12월 13일(일) 오후 1시 30분 · 더뉴컨벤션 5층 제니스홀",
    ogImage: "/og-image-v2.jpg",
    siteUrl: "https://jihpjemobilewedding.vercel.app",
  },
  bgm: {
    src: "/music/bgm.mp3", // 저작권 프리 연주곡
  },
};
