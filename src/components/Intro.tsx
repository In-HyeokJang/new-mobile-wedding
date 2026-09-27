import Image from "next/image";
import Reveal from "./Reveal";
import type { IntroData } from "@/types";

// 첫 화면은 사진 한 장으로만 채우고, 텍스트는 그 아래로 내린다.
// (예전에는 사진 위에 텍스트를 얹었지만 사진이 가려져서 분리했다)
// 서버 컴포넌트(상호작용 없음). config 대신 props 주입 → 빌더 재사용 대비.
export default function Intro({ data }: { data: IntroData }) {
  return (
    <>
      {/* 화면 가장자리에서 살짝 띄운 둥근 카드. 위·좌우 여백은 같은 폭(0.75rem)이고,
          위쪽은 노치/상태바 영역(safe-area)만큼 더 띄운다.
          h-screen-intro = 화면 높이 - 1.5rem → 첫 화면 아래에 여백이 살짝 보여
          "밑에 내용이 더 있다"는 신호도 된다.
          svh 는 모바일 주소창 높이 변화를 반영하고, 모르는 구형 브라우저는 vh 로 폴백 (globals.css) */}
      <div
        className="px-3"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        <section className="h-screen-intro relative w-full overflow-hidden rounded-[1.75rem] bg-ink">
          <Image
            src={data.mainPhoto}
            alt={`${data.groomName} & ${data.brideName}`}
            fill
            priority
            // 래퍼(main)가 max-w-[430px] 라 실제 표시 폭은 화면 전체가 아니다 (좌우 여백 포함).
            // 100vw 로 두면 PC 에서 쓸데없이 큰 원본을 받아온다
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
            style={{ objectPosition: data.mainPhotoPosition ?? "center" }}
          />

          {/* 아래에 내용이 더 있다는 신호. 사진이 화면을 꽉 채우면
              스크롤할 게 있는지 모르고 나가버리는 경우가 있다.
              밝은 사진에서도 화살표가 보이도록 얕은 그라디언트를 깐다 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-6 w-6 animate-bounce text-white/85 [animation-duration:2s]"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </section>
      </div>

      {/* 2) 사진 아래 텍스트 — 이름 / 날짜 / 장소 */}
      <Reveal>
        <section className="px-8 pt-14 pb-12 text-center">
          <h1 className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 break-keep font-display text-2xl leading-tight tracking-tight text-ink min-[380px]:text-[1.75rem]">
            <span className="whitespace-nowrap">{data.groomName}</span>
            {/* 캘린더·맺음말과 같은 하트 색. 이모지(❤️)는 기기마다 모양이 달라 SVG 로 그린다 */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-label="하트"
              className="h-[0.8em] w-[0.8em] shrink-0 text-heart"
            >
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.9 1.3 5.2 3.1 1.3-1.8 3-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
            <span className="whitespace-nowrap">{data.brideName}</span>
          </h1>
          {/* break-keep — 줄이 넘치면 "30 / 분" 처럼 단어 중간이 아니라 띄어쓰기에서 끊는다.
              320px 폰에서만 15px 로 줄여 한 줄에 들어가게 한다 */}
          <p className="mt-6 break-keep font-body text-[15px] text-body min-[360px]:text-base">
            {data.dateText}
          </p>
          <p className="mt-1.5 break-keep font-body text-[15px] text-muted min-[360px]:text-base">
            {data.placeText}
          </p>
        </section>
      </Reveal>
    </>
  );
}
