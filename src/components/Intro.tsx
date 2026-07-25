import Image from "next/image";
import type { IntroData, Theme } from "@/types";

// 첫 화면: 풀블리드 사진 + 하단 정렬 텍스트.
// 서버 컴포넌트(상호작용 없음). config 대신 props 주입 → 빌더 재사용 대비.
export default function Intro({ data, theme }: { data: IntroData; theme: Theme }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <Image
        src={data.mainPhoto}
        alt={`${data.groomName} & ${data.brideName}`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* 하단 가독성 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      {/* 하단 정렬 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 p-8 pb-14 text-center text-white">
        <p className="font-body text-xs uppercase tracking-[0.35em] opacity-85">
          We&apos;re getting married
        </p>
        <h1 className="mt-4 font-display text-3xl min-[380px]:text-4xl sm:text-5xl leading-tight tracking-tight break-keep flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <span className="whitespace-nowrap">{data.groomName}</span>
          <span style={{ color: theme.accent }}>&amp;</span>
          <span className="whitespace-nowrap">{data.brideName}</span>
        </h1>
        <p className="mt-5 font-body text-base opacity-90">{data.dateText}</p>
        <p className="font-body text-sm opacity-70">{data.placeText}</p>
      </div>
    </section>
  );
}
