# Phase 5a: Vercel 배포 + GitHub Actions CI/CD

**Goal:** GitHub Actions로 코드 검증(CI) + Vercel native 연동으로 자동 배포(CD). 프로덕션 도메인을 확보해 이후 Kakao 지도/공유 등록에 사용.

**전략(하이브리드):**
- `dev` = 개발 브랜치
- `main` = 프로덕션 (push 시 Vercel 자동 배포)
- 흐름: dev 개발 → main 머지 → GitHub Actions CI(빌드·타입체크·린트) → Vercel 자동 배포

---

## 1. GitHub Actions CI
`.github/workflows/ci.yml` — push(main,dev)/PR(main) 시 실행:
`npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build`.
- 배포는 하지 않음(그건 Vercel 몫). 순수 검증 게이트.
- 시크릿 불필요 (빌드는 Supabase 키 없이 통과 — 서버 클라이언트는 런타임 지연 생성).

## 2. Vercel 연동 (사용자 1회 설정)
1. https://vercel.com 가입 (GitHub 계정으로 로그인 추천).
2. **Add New… → Project** → GitHub 레포 `In-HyeokJang/new-mobile-wedding` **Import**.
3. Framework: Next.js 자동 감지. Root/Build 설정 기본값.
4. **Environment Variables** 3개 등록 (Production + Preview 모두 체크):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Deploy** 클릭 → 프로덕션 브랜치(`main`) 빌드.
6. Settings → Git → **Production Branch = main** 확인.

## 3. 배포 결과
- 프로덕션 URL: `https://new-mobile-wedding.vercel.app` (또는 Vercel이 부여하는 도메인).
- 이후 push → main 마다 자동 재배포. dev/PR은 **프리뷰 배포** 자동 생성.

## 4. 이후 Kakao 연동 준비
- 확보한 Vercel 도메인을 Kakao Developers → 앱 → 플랫폼(Web) 사이트 도메인에 등록.
- 그 뒤 Phase 5b(지도/공유) 진행.

## 검증
- GitHub → Actions 탭에서 CI 초록 체크 확인.
- Vercel 도메인 접속 → 7개 섹션 렌더 + 실제 폰에서 RSVP/방명록 저장 확인.
