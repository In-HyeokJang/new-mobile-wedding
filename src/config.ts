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
    brideName: "박재은", // TODO: 신부 이름
    dateText: "2026. 12. 13. SUN 1:30 PM",
    placeText: "더뉴컨벤션 웨딩홀 제니스홀 5층",
    mainPhoto: "/images/main.jpg", // TODO: 실제 메인 사진으로 교체
  },
  invitation: {
    greeting: [
      "서로가 마주 보며 다져온 사랑을",
      "이제 함께 한 곳을 바라보며",
      "걸어갈 수 있는 큰 사랑으로 키우려 합니다.",
      "저희 두 사람의 시작을 축복해 주세요.",
    ],
    // TODO: 실제 양가 부모님 성함/신부 이름
    groom: { fatherName: "장면섭", motherName: "김선숙", childRelation: "아들", childName: "장인혁" },
    bride: { fatherName: "박민규", motherName: "정정아", childRelation: "딸", childName: "○○○" },
  },
  calendar: {
    year: 2026,
    month: 12,
    day: 13,
    hour: 13,
    minute: 30,
    timeText: "오후 1시 30분",
  },
  location: {
    name: "더뉴컨벤션 웨딩홀",
    hallText: "제니스홀 5층",
    address: "서울특별시 강서구 공항대로36길 57",
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
  ourStory: {
    title: "우리 두 사람의 이야기",
    // TODO: 실제 인터뷰 내용으로 교체
    qa: [
      { q: "처음 만난 순간은?", a: "친구 소개로 만나 첫 대화부터 잘 통했어요." },
      { q: "서로의 첫인상은?", a: "멀리서 봐도 이쁘고 아름다운 여자가 첫눈에 들어왔어요." },
      { q: "프러포즈는 어땠나요?", a: "아직 고민중~" },
    ],
  },
  share: {
    title: "인혁 ♥ 재은 결혼합니다", // TODO: 신부 이름
    description: "2026년 12월 13일 일요일 오후 1시 30분 · 더뉴컨벤션 웨딩홀",
    ogImage: "/og-image.jpg",
    siteUrl: "https://jihpjemobilewedding.vercel.app",
  },
  bgm: {
    src: "/music/bgm.mp3", // TODO: 저작권 프리 연주곡 파일 넣기
  },
};
