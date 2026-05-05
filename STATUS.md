# 픽셀단타왕 — 진행 상황 & 다음 계획

마지막 업데이트: 2026-05-05

## 지금까지 한 것

### 게임 본체 (PR/커밋)
- [a1c8e8c] 사운드/햅틱 + 일일 챌린지 + 튜토리얼 + 공유 카드 + 엿보기 미리보기
- [314516e] 앱인토스 WebView 미니앱 빌드 설정

### 디자인 검토 후 손본 것
1. **시나리오 이름 매칭 화면 노출 제거** — `[떡상 후 폭락]` 같은 정답 누설 차단 (`MatchingScreen.tsx`)
2. **차트 Y축 확장 윈도우** — 매 틱마다 출렁이던 캔들 안정화 (`PlayScreen.tsx` + `chartRenderer.ts`)
3. **HOLD 함정 → "엿보기"로 재설계** — 1슬롯 소모 + 다음 3캔들 회색 점선 고스트 미리보기. 정보 vs 행동권 트레이드오프
4. **사운드 8종 + 햅틱** — WebAudio로 합성 (에셋 0KB), 매수/매도/카운트다운/승패 비프, `navigator.vibrate()`
5. **홈 ON/OFF 음소거 토글** — localStorage 영속
6. **일일 챌린지** — mulberry32 PRNG + KST `dailySeed` → 모든 기기 같은 차트, 1일 1회 (localStorage YYYY-MM-DD), 골드 배지 카드
7. **튜토리얼 1판** — 첫 실행 자동 진입, V자 반등 시나리오 + 삼송전기 + 시드 7 강제, 단계별 가이드 텍스트, 통계 집계 제외
8. **공유 카드** — Canvas 600×800 PNG (수익률 색조 그라디언트, 캐릭+티어 스프라이트, 닉네임, "★ 오늘의 챌린지" 배지), Web Share API 이미지 첨부 → PNG 다운로드 폴백

### 검증 방식
- 실플레이 +48.3% 전설의 단타왕 결과 화면 캡처
- `buildShareCard()` 직접 호출 → 108KB image/png Blob 생성 + 화면 렌더 시각 확인
- 엿보기 → 차트 우측 끝에 회색 점선 ghost 캔들 3개 캡처
- localStorage 초기화 → 풀 리로드 → 튜토리얼 자동 진입 확인
- 챌린지 1/일 게이트 동작 확인

## 토스 앱인토스 등록 절차 (요약)

### 사전 요건
- 만 19세 이상
- 본인 명의로 로그인된 토스앱
- 사업자 등록 **필요 없음** (수익화 기능 안 쓰면)

### 콘솔 가입 → 워크스페이스 → 앱 등록
1. [apps-in-toss.toss.im](https://apps-in-toss.toss.im) 회원가입 (토스앱 본인 인증)
2. 워크스페이스 생성 (사업자당 1개, 이름 중복 불가)
3. 앱 메뉴 → "+등록하기"
4. 입력 필드:
   - 앱 로고 600×600 PNG
   - 앱 이름 / 영문명
   - **appName: `pixel-stonks`** (수정 불가, `granite.config.ts`와 일치 필수)
   - 사용 연령 (현재 19세 이상만)
   - 고객센터 정보 (이메일/연락처/채팅)
   - 썸네일 1100×800 PNG
   - 부제·상세 설명·검색 키워드
   - 카테고리: 게임
   - 게임 등급분류 증명서 + 자체등급분류 정보 + 플레이 화면 캡처

### 빌드 & 업로드
```bash
npm run ait:build   # → pixel-stonks.ait (4.3MB)
npm run ait:deploy  # → 콘솔에 업로드. --api-key 또는 ait token add 필요
```

### 검토 → 출시
- 콘솔에서 "검토 요청하기" 클릭 → 영업일 1~3일
- 통과 후 "출시하기" 클릭 → 즉시 전체 사용자 공개
- 한 번에 한 버전만 제출 가능

### 게임 등급분류 (옵션 A vs B)
- **A. 게임물관리위원회 직접 신청** — 10~15일, 수수료 발생, 공식 등급분류증명서
- **B. 자체등급분류 (IARC)** — Apple/Google 스토어 출시 시 즉시 자동 부여 (Apple $99/년, Google $25 1회). 청소년이용불가 게임은 게임위 추가 심의
- 인디 게임 = 보통 B로 시작. 본 게임은 도박 요소 없는 시뮬레이션이라 전체이용가 가능성 큼

### 사업자 등록 시 풀리는 기능 (지금은 다 안 씀)
- 토스 로그인, 비즈월렛, 프로모션, 인앱 광고, 인앱 결제, 토스페이

## 앞으로 할 것

### P0 — 검수 통과를 위한 필수
- [ ] 앱 로고 600×600 PNG 제작 (현재 favicon.svg → PNG 변환)
- [ ] 썸네일 1100×800 PNG 제작 (게임 플레이 미리보기 + 타이틀)
- [ ] 플레이 스크린샷 세로형 3장 이상 (홈/플레이/결과)
- [ ] 게임 등급분류: 자체등급분류 절차 (Apple/Google 스토어 등록 → IARC 자동) 또는 GRAC 직접 신청
- [ ] 콘솔 회원가입 + 워크스페이스 생성 + 앱 등록 (사용자 본인 토스앱 필요)
- [ ] `appName=pixel-stonks` 가 콘솔에 등록한 값과 정확히 일치하는지 검증
- [ ] 부제/상세 설명/검색 키워드 카피 작성 ("30초 단타 주식 시뮬레이션, 1일 1회 챌린지" 등)

### P1 — 검수 반려 가능성 줄이기
- [ ] 토스앱 샌드박스에서 실기기 테스트 (iOS/Android 각 1회)
   - `npm run dev --host` + 샌드박스 앱에서 IP 입력
   - 매수/매도/엿보기/공유/사운드/햅틱 모두 동작 확인
- [ ] 결과 화면 공유 카드의 Web Share API가 토스앱 WebView에서 동작하는지 확인 (안 되면 다운로드 폴백 자연스러운지)
- [ ] Supabase 리더보드 환경변수(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) 운영 환경 세팅
- [ ] 리더보드 어뷰징 방지 — 1일 N회 제한 또는 평균 수익률로 점수 산정 (현재 각자 best 기록만 비교)
- [ ] 자체등급분류 정보를 콘솔에 입력 (스토어 등록자명, 분류번호, 등급, 자체등급분류사업자명)

### P2 — 출시 후 개선
- [ ] 결과 화면에 백분위 표시 ("Top X%") — 현재는 절대 수익률만
- [ ] 메타 진행감 — 5판마다 캐릭터 1개씩 해금 (재플레이 동기)
- [ ] 매칭 화면 4.5초 → 2.5초 단축 (슬롯 1.5s + 카운트 1s)
- [ ] PlayScreen 차트를 화면 주인공으로 — 잔액/매매권/티커는 차트 모서리 HUD로 작게
- [ ] 사운드 미리듣기 + 음량 조절 (현재 ON/OFF 토글만)
- [ ] 카카오톡 SDK 연동 (Web Share API 안 되는 환경 대안)
- [ ] Supabase RLS 정책 강화 + 동일 user_id 1일 N회 INSERT 제한 트리거
- [ ] 광고 통합 (사업자 등록 후) — 무료 5판 후 광고 또는 부활 광고

### P3 — 콘텐츠 추가
- [ ] 캐릭터/시나리오 추가 (현재 9캐릭 × 10시나리오)
- [ ] 새 게임 모드 — 라이브 차트 (실시간), 토너먼트 등
- [ ] 시즌제 — 매주 다른 시나리오 비중

## 알려진 제약
- 토스앱 SDK 1.x → 2.x 마이그레이션 마감: 2026-03-23 (이미 지남, 2.4.7 사용 중이라 OK)
- 앱 번들 압축 해제 기준 100MB 이하 (현재 1.2MB / 4.3MB ait → 충분)
- 빌드 후 `pixel-stonks.ait` 한 번에 한 버전만 콘솔 업로드 가능
- React 19 + RN 0.84 지원, 현재 코드 React 19.2 → 호환

## 파일 트리 변경
- `+` `granite.config.ts` (앱인토스 빌드 설정)
- `+` `.granite/app.json` (앱 매니페스트, gitignore됨)
- `+` `pixel-stonks.ait` (빌드 산출물, gitignore됨)
- `+` `src/utils/rng.ts` (mulberry32 시드 PRNG)
- `+` `src/utils/sound.ts` (WebAudio + 햅틱)
- `+` `src/utils/shareCard.ts` (Canvas 공유카드 합성)

## 참고 링크
- 콘솔: https://apps-in-toss.toss.im
- 개발자센터: https://developers-apps-in-toss.toss.im
- WebView 튜토리얼: https://developers-apps-in-toss.toss.im/tutorials/webview.html
- 미니앱 출시 가이드: https://developers-apps-in-toss.toss.im/development/deploy.html
- 사업자 등록 (수익화): https://developers-apps-in-toss.toss.im/prepare/register-business.html
- 게임 등급분류: https://toss.im/apps-in-toss/blog/game_rating_classification
- 자체등급분류 입력: https://toss.im/apps-in-toss/blog/self-rated_game_distribution
