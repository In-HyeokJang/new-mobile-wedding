import Intro from "@/components/Intro";
import { config } from "@/config";

// 섹션 배치(순서). config를 읽어 각 섹션에 props로 주입.
export default function Home() {
  return (
    <main>
      <Intro data={config.intro} theme={config.theme} />
    </main>
  );
}
