import Section from "./Section";
import type { OurStoryData } from "@/types";

// 두 사람의 인터뷰 Q&A. 정적 → 서버 컴포넌트. props 주입.
export default function OurStory({ data }: { data: OurStoryData }) {
  return (
    <Section eyebrow="Our Story" className="bg-canvas">
      <div className="mx-auto max-w-md">
        {data.title && (
          <h2 className="mb-10 text-center font-display text-2xl text-ink">
            {data.title}
          </h2>
        )}
        <ul className="space-y-8">
          {data.qa.map((item, i) => (
            <li key={i} className="border-b border-hairline pb-6 last:border-0">
              <p className="font-body text-sm font-semibold text-accent">
                Q. {item.q}
              </p>
              <p className="mt-2 font-body leading-relaxed text-body">
                {item.a}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
