import Image from "next/image";
import Reveal from "./Reveal";
import type { IntroData, Theme } from "@/types";

// 첫 화면은 사진 한 장으로만 채우고, 텍스트는 그 아래로 내린다.
// (예전에는 사진 위에 텍스트를 얹었지만 사진이 가려져서 분리했다)
// 서버 컴포넌트(상호작용 없음). config 대신 props 주입 → 빌더 재사용 대비.
export default function Intro({ data, theme }: { data: IntroData; theme: Theme }) {
  return (
    <>
      {/* 1) 첫 화면 — 사진만. h-[100svh] 는 모바일 주소창 높이 변화를 반영한다 */}
      <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
        <Image
          src={data.mainPhoto}
          alt={`${data.groomName} & ${data.brideName}`}
          fill
          priority
          // 래퍼(main)가 max-w-[430px] 라 실제 표시 폭은 화면 전체가 아니다.
          // 100vw 로 두면 PC 에서 쓸데없이 큰 원본을 받아온다
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
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

      {/* 2) 사진 아래 텍스트 — 이름 / 날짜 / 장소 */}
      <Reveal>
        <section className="px-8 pt-20 pb-16 text-center">
          <h1 className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 break-keep font-display text-2xl leading-tight tracking-tight text-ink min-[380px]:text-[1.75rem]">
            <span className="whitespace-nowrap">{data.groomName}</span>
            <span style={{ color: theme.accent }}>&amp;</span>
            <span className="whitespace-nowrap">{data.brideName}</span>
          </h1>
          <p className="mt-6 font-body text-sm text-body">{data.dateText}</p>
          <p className="mt-1.5 font-body text-sm text-muted">{data.placeText}</p>
        </section>
      </Reveal>
    </>
  );
}
