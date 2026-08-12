import Intro from "@/components/Intro";
import Invitation from "@/components/Invitation";
import Calendar from "@/components/Calendar";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Account from "@/components/Account";
import Guestbook from "@/components/Guestbook";
import BgmToggle from "@/components/BgmToggle";
import Reveal from "@/components/Reveal";
import { config } from "@/config";

// 섹션 배치(순서). config를 읽어 각 섹션에 props로 주입.
// TODO: 하객 사진 업로드(포토 게스트북) 섹션을 방명록 뒤에 추가 예정.
export default function Home() {
  return (
    // overflow-x-clip 을 쓴다. overflow-x:hidden 은 CSS 규칙상 반대 축(y)을
    // visible 로 둘 수 없어 auto 로 바꿔버리고, 그러면 이 main 이 스크롤 컨테이너가
    // 되어 브라우저 스크롤바 옆에 스크롤바가 하나 더 생긴다. clip 은 그 부작용이 없다.
    <main className="mx-auto min-h-screen max-w-[430px] bg-canvas overflow-x-clip shadow-sm">
      {/* 인트로 첫 화면(사진)은 감싸지 않는다 — 링크를 열자마자 바로 떠야 한다.
          인트로 내부의 텍스트 블록만 Intro.tsx 안에서 따로 등장시킨다 */}
      <Intro data={config.intro} theme={config.theme} />

      <Reveal>
        <Invitation data={config.invitation} />
      </Reveal>
      <Reveal>
        <Calendar data={config.calendar} theme={config.theme} />
      </Reveal>
      <Reveal>
        <Gallery data={config.gallery} />
      </Reveal>
      <Reveal>
        <Location data={config.location} />
      </Reveal>
      <Reveal>
        <Account data={config.account} />
      </Reveal>
      <Reveal>
        <Guestbook />
      </Reveal>

      {/* 화면에 고정되는 버튼이라 Reveal 로 감싸면 안 된다 (transform 이 fixed 를 깬다) */}
      <BgmToggle data={config.bgm} theme={config.theme} />
    </main>
  );
}
