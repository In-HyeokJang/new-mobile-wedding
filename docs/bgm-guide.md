# 🎵 배경음악(BGM) 만들기 가이드

> 모바일 청첩장 배경음악(`public/music/bgm.mp3`)을 **직접 만들거나 구해서 넣기** 위한 가이드.
> 재생 기능(우하단 토글)은 이미 완성돼 있음 → **파일만 넣으면 바로 작동**함.

- **넣을 위치**: `public/music/bgm.mp3`
- **코드 경로 설정**: [`src/config.ts`](../src/config.ts) → `bgm.src: "/music/bgm.mp3"` (파일명 바꾸면 여기도 같이 수정)
- **재생 컴포넌트**: [`src/components/BgmToggle.tsx`](../src/components/BgmToggle.tsx) — `loop` 재생, 모바일은 첫 화면 탭에서 재생 시도

---

## ✅ 목표 스펙 (이 조건만 맞으면 됨)

| 항목 | 권장 값 | 이유 |
|---|---|---|
| 파일명 | `bgm.mp3` | config 경로와 일치 |
| 포맷 | **MP3** (128~192kbps) | 모든 브라우저 호환, 용량 적당 |
| 길이 | **60~120초** | `loop`으로 반복되니 짧아도 됨. 자연스럽게 이어지는 구간이면 이상적 |
| 용량 | **1~3MB 이하** | 모바일 로딩 빠르게 (`preload="none"`이라 탭 후 로드됨) |
| 분위기 | 잔잔한 **연주곡(가사 없음)** | 청첩장엔 보컬 없는 게 무난 |
| 볼륨 | 너무 크지 않게 | 자동으로 크게 나오면 놀람. 원본이 크면 아래 4번으로 낮추기 |

> ⚠️ **저작권**: 청첩장은 여러 사람에게 공유·배포되므로 반드시 **상업/공유 이용 가능한 저작권 프리** 음원이어야 함. 아이돌/가요 등 상용곡 금지.

---

## 🎹 어떤 분위기로? (추천)

- **잔잔한 솔로 피아노** — 가장 무난, 청첩장 클래식
- **어쿠스틱 기타 / 로파이(lo-fi)** — 따뜻하고 편안한 느낌
- **스트링 + 피아노** — 감성적, 살짝 웅장
- 키워드 예: `soft piano`, `romantic`, `warm`, `gentle`, `wedding`, `acoustic`, `calm`, `heartfelt`

---

## 🎯 이번 프로젝트 추천 방법 — Pixabay Music에서 솔로 피아노 찾기

이 청첩장 디자인은 아이보리 배경(`#faf9f5`) + 오렌지 포인트(`#ff630f`)의 **담백하고 미니멀한 톤**([`src/config.ts`](../src/config.ts) `theme`). 그래서 눈물샘 자극형보다는 **잔잔하고 절제된 솔로 피아노**가 잘 어울림. 무료 상업 이용이 확실한 **Pixabay Music**으로 바로 찾는 법.

### 1) 검색창에 그대로 붙여넣을 검색어 (하나씩 시도)

1. `solo piano wedding`
2. `soft piano emotional`
3. `warm piano minimal`
4. `gentle piano background`
5. `piano ambient calm`

> Pixabay는 한글 검색보다 **영어 키워드**가 결과가 훨씬 많고 정확함.

### 2) Pixabay 사이트에서 찾는 순서

1. **pixabay.com/music** 접속 (로그인 불필요, 다운로드만 무료 계정 권장)
2. 검색창에 위 키워드 중 하나 입력 → 검색
3. 왼쪽/상단 필터에서:
   - **Genre**: `Cinematic` 또는 `Classical` (피아노 계열이 많이 걸림)
   - **Mood**: `Calm`, `Happy`, `Romantic` 중 선택
   - **Duration**: 재생목록이 `loop`으로 반복되니 **1~2분대** 필터가 다루기 편함 (더 길어도 됨, 나중에 잘라도 됨)
4. 재생 버튼(▶)으로 미리듣기 → 마음에 드는 곡 여러 개 후보로 찜
5. 후보 중에서:
   - 도입부가 조용히 시작하고 끝부분도 자연스럽게 잦아드는 곡 (루프 이음새가 매끄러움)
   - 피아노 단독 or 피아노+얇은 스트링 정도 (너무 웅장한 풀오케스트라는 피하기)
6. **Download** 버튼 클릭 → **MP3** 포맷 선택 후 다운로드 (무료 회원가입 요구할 수 있음, 무료)

### 3) 라이선스 확인 (중요, 1번만 하면 됨)

- Pixabay 음원은 **Pixabay Content License** — 출처 표기 없이 상업적 이용 포함 무료 사용 가능
- 다운로드 페이지 하단에 라이선스 안내가 있으니 한 번 확인 (곡 재배포·판매만 금지, 청첩장 배경음악 용도는 문제 없음)
- 원하면 [`MANUAL.md`](../MANUAL.md)에 곡 제목/아티스트명 한 줄 남겨두면 나중에 추적하기 편함

### 4) 받은 파일 넣기

1. 다운로드된 파일명을 `bgm.mp3`로 변경
2. `public/music/bgm.mp3` 위치에 덮어쓰기
3. 곡이 2분 넘게 길거나 볼륨이 크면 → 아래 **4번 "MP3 다듬기"** 섹션 참고해서 다듬기
4. 아래 **5번 "넣고 확인하기"** 로 로컬 테스트 후 배포

---

## 다른 대안들 (Pixabay가 안 맞을 때)

Pixabay에서 원하는 느낌을 못 찾으면 아래 방법들도 있음.

---

## 방법 A. AI로 생성하기 (가장 빠름) 🤖

무료/부분무료 AI 작곡 툴에 프롬프트를 넣고 뽑는 방법.

**추천 툴**
- **Suno** (suno.com) — 텍스트 프롬프트로 곡 생성, 무료 크레딧 제공
- **Udio** (udio.com) — 유사, 퀄리티 좋음
- **Stable Audio** (stableaudio.com) — 짧은 인스트루멘탈에 강함

**프롬프트 예시 (영어가 결과가 더 좋음)**
```
A gentle, warm solo piano instrumental for a wedding.
Soft, romantic, calm, heartfelt. No vocals. Loopable, 90 seconds.
```
```
Acoustic guitar and soft strings, warm and hopeful wedding background music.
Instrumental only, gentle tempo, seamless loop.
```

> ⚠️ **AI 음원 라이선스 확인 필수**: 무료 플랜은 상업/공유 이용이 제한될 수 있음. 각 서비스의 라이선스(다운로드 권한/상업 이용)를 반드시 확인하고, 필요하면 유료 크레딧으로 상업 이용 권한이 포함된 다운로드를 받을 것.

---

## 방법 B. 저작권 프리 라이브러리에서 받기 (안전) 📚

이미 만들어진 무료 음원을 받는 방법. 라이선스가 명확해서 가장 안전.

- **Pixabay Music** — 위 "🎯 이번 프로젝트 추천 방법" 섹션 참고 (가장 추천)
- **YouTube 오디오 보관함** (studio.youtube.com → 오디오 보관함) — "저작자 표시 필요 없음" 필터, 무료
- **Free Music Archive** (freemusicarchive.org) — CC 라이선스 (표시 조건 확인)
- **Incompetech** (incompetech.com) — Kevin MacLeod, CC-BY (출처 표기 조건)
- **Bensound** (bensound.com) — 무료/유료 혼합

**검색 키워드**: `wedding piano`, `romantic instrumental`, `soft acoustic`, `emotional piano`

> 다운로드한 곡의 **라이선스 표기 조건**(출처 표시 필요 여부)을 확인하고, 필요하면 청첩장 하단이나 매뉴얼에 크레딧을 남길 것.

---

## 방법 C. 직접 작곡하기 (무료 DAW) 🎼

- **BandLab** (bandlab.com) — 웹 브라우저에서 무료, 루프/악기 내장
- **GarageBand** (macOS/iOS) — 애플 기기면 무료, 피아노 루프로 쉽게 제작
- **Chrome Music Lab — Song Maker** — 아주 간단한 멜로디용

만든 뒤 **MP3로 export** → 4번 최적화 → `public/music/bgm.mp3`.

---

## 4. MP3 다듬기 (길이 자르기 / 볼륨 낮추기)

곡이 길거나 소리가 크면 아래로 조정. (터미널에서 `ffmpeg` 사용)

```bash
# 30초~120초 구간만 잘라서 mp3로 (예: 시작 0초부터 90초)
ffmpeg -i 원본.mp3 -ss 0 -t 90 -c:v copy -b:a 160k bgm.mp3

# 볼륨을 60%로 낮추기
ffmpeg -i bgm.mp3 -filter:a "volume=0.6" bgm-quiet.mp3

# 페이드인/아웃(루프 이음새 부드럽게, 2초씩)
ffmpeg -i bgm.mp3 -af "afade=t=in:st=0:d=2,afade=t=out:st=88:d=2" bgm-fade.mp3
```

> `ffmpeg`이 없으면 온라인 툴(예: mp3cut.net, Audio Trimmer)로도 자르기/볼륨 조절 가능.

---

## 5. 넣고 확인하기

1. 완성된 파일을 `public/music/bgm.mp3` 로 저장 (덮어쓰기)
2. `npm run dev` → http://localhost:3000
3. 화면을 한 번 탭 → 우하단 **♪ 버튼**이 돌면 재생 중
4. 버튼 눌러서 켜기/끄기 확인
5. 커밋 후 배포:
   ```
   git add public/music/bgm.mp3
   git commit -m "feat: 배경음악 bgm.mp3 추가"
   git push origin dev   # 이후 main 머지 → Vercel 자동 배포
   ```

> 파일명을 `bgm.mp3`가 아닌 다른 이름으로 하려면 [`src/config.ts`](../src/config.ts)의 `bgm.src` 경로도 같이 수정.

---

## 📌 참고
- 운영 매뉴얼: [`MANUAL.md`](../MANUAL.md)
- BGM 재생 로직: [`src/components/BgmToggle.tsx`](../src/components/BgmToggle.tsx)
