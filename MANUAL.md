# 모바일 청첩장 — 수정 매뉴얼 & 기록

> 바이브코딩으로 만든 내 모바일 청첩장을 **직접 수정·운영**하기 위한 매뉴얼.
> 새로 교체할 것이 생기면 아래 **"🔧 교체 예정(TODO)"** 에 계속 추가해두기.

- **배포 주소**: https://jihpjemobilewedding.vercel.app/
- **GitHub**: https://github.com/In-HyeokJang/new-mobile-wedding
- **예식**: 2026-12-13(일) 13:30

---

## 🚀 수정 → 반영하는 법 (기본 흐름)

1. `dev` 브랜치에서 파일 수정
2. 로컬 확인: `npm run dev` → http://localhost:3000
3. 커밋 후 push: `git push origin dev`
4. `main`으로 머지하면 **Vercel 자동 배포**
   ```
   git switch main; git merge dev --ff-only; git push origin main; git switch dev
   ```
   (또는 GitHub에서 dev→main PR 병합)

> ⚠️ `.env.local`(Supabase 키)은 git에 안 올라감. Vercel은 대시보드 Environment Variables에 별도 등록되어 있음.

---

## ✏️ 어디를 고치면 뭐가 바뀌나

### 글자/정보 → `src/config.ts` (여기 값만 바꾸면 됨)
| 항목 | config 위치 |
|---|---|
| 신랑·신부 이름, 예식 일시/장소 | `intro` |
| 인사말, 양가 혼주 | `invitation` |
| 달력 날짜/시간 | `calendar` |
| 갤러리 사진 경로 | `gallery.photos` |
| 인터뷰 Q&A | `ourStory` |
| 카톡 공유 제목/설명/도메인 | `share` |

### 사진/이미지 → `public/` 에 같은 파일명으로 덮어쓰기
| 파일 | 용도 | 권장 |
|---|---|---|
| `public/images/main.jpg` | 첫 화면 메인 사진 | 세로 사진 |
| `public/images/gallery-1~6.jpg` | 갤러리 | 정사각형/세로 |
| `public/og-image.jpg` | 카톡 공유 썸네일 | 1200×630 가로 |
| `public/music/bgm.mp3` | 배경음악 | mp3 |

> 사진은 코드가 자동으로 흑백(`grayscale`) 처리함. 컬러 원본 그대로 올리면 됨.

### 색/폰트(디자인 토큰) → `src/app/globals.css` 의 `@theme`
- 포인트 색 `--color-accent: #ff630f` 등.

### 카톡 공유 미리보기가 안 바뀔 때
- 카카오가 캐시함 → https://developers.kakao.com/tool/clear/og 에서 URL 넣고 초기화.

---

## 🔧 교체 예정 (TODO) — 실제 값/파일로 바꿀 것

- [ ] 신부 이름 (`config.ts`의 `intro.brideName`, `invitation.bride.childName`, `share.title`)
- [ ] 양가 부모님 성함 (`invitation.groom`, `invitation.bride`)
- [ ] 예식장/홀 이름 (`intro.placeText`, `share.description`)
- [ ] 인사말 문구 (`invitation.greeting`)
- [ ] 인터뷰 Q&A 실제 내용 (`ourStory.qa`)
- [ ] 메인 사진 `public/images/main.jpg` (지금 임시 플레이스홀더)
- [ ] 갤러리 사진 `public/images/gallery-1~6.jpg` (지금 숫자 플레이스홀더)
- [ ] OG 공유 이미지 `public/og-image.jpg` (지금 임시 디자인)
- [ ] 배경음악 `public/music/bgm.mp3`

---

## 📌 참고
- Supabase 키 발급/배포 방법: Notion "모바일 청첩장 개발 → Supabase 설정" 페이지.
- 설계/계획 문서: `docs/superpowers/` 안 spec·plan.
- 디자인 베이스: Claude(design-md) 각색 — `DESIGN.md`.
