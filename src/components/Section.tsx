// 모든 섹션이 공유하는 래퍼: 상단 eyebrow(오렌지 소제목) + 좌우/상하 여백.
// DRY — 섹션마다 같은 여백/제목 스타일을 반복하지 않도록 한 곳에 모음.
export default function Section({
  eyebrow,
  children,
  className = "",
}: {
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-8 py-20 ${className}`}>
      {eyebrow && (
        <p className="mb-10 text-center font-body text-xs uppercase tracking-[0.35em] text-accent">
          {eyebrow}
        </p>
      )}
      {children}
    </section>
  );
}
