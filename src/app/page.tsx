import Intro from "@/components/Intro";
import Invitation from "@/components/Invitation";
import Calendar from "@/components/Calendar";
import Location from "@/components/Location";
import Gallery from "@/components/Gallery";
import OurStory from "@/components/OurStory";
import Guestbook from "@/components/Guestbook";
import BgmToggle from "@/components/BgmToggle";
import { config } from "@/config";

// 섹션 배치(순서). config를 읽어 각 섹션에 props로 주입.
export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-canvas overflow-x-hidden shadow-sm">
      <Intro data={config.intro} theme={config.theme} />
      <Invitation data={config.invitation} />
      <Calendar data={config.calendar} theme={config.theme} />
      <Location data={config.location} />
      <Gallery data={config.gallery} />
      <OurStory data={config.ourStory} />
      <Guestbook />
      <BgmToggle data={config.bgm} theme={config.theme} />
    </main>
  );
}
