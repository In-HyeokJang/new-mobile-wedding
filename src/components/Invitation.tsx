import Section from "./Section";
import type { ParentLine, InvitationData } from "@/types";

// 혼주 한 줄: "장○○ · ○○○의 아들 장인혁"
function ParentNames({ p }: { p: ParentLine }) {
  return (
    <p className="font-body text-body">
      {p.fatherName && <span>{p.fatherName}</span>}
      {p.fatherName && p.motherName && <span className="text-muted"> · </span>}
      {p.motherName && <span>{p.motherName}</span>}
      <span className="text-muted">의 {p.childRelation} </span>
      <span className="text-ink">{p.childName}</span>
    </p>
  );
}

// 인사말 + 혼주. 상호작용 없음 → 서버 컴포넌트. config 대신 props 주입.
export default function Invitation({ data }: { data: InvitationData }) {
  return (
    <Section eyebrow="Invitation" className="bg-canvas text-center">
      <div className="mx-auto max-w-md">
        <div className="space-y-2 font-display text-lg leading-relaxed text-ink">
          {data.greeting.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="mx-auto my-12 h-px w-12 bg-hairline" />

        <div className="space-y-3">
          <ParentNames p={data.groom} />
          <ParentNames p={data.bride} />
        </div>
      </div>
    </Section>
  );
}
