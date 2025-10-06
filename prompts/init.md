# 개인대시보드 v0.1 — 가계부 구현 계획

## Phase 0: 프로젝트 초기 설정 ✅
- [x] Next.js 15 + TypeScript 프로젝트 초기화
- [x] 필수 의존성 설치 (Prisma, NextAuth, ag-Grid, React Query, Zod 등)
- [x] Prisma 스키마 정의 (User, Transaction, FixedExpenseTemplate)
- [x] ESLint, Prettier 설정
- [x] 환경변수 템플릿 (.env.example) 생성

---

## Phase 1: 인프라 & 인증 기반 구축

### 1-1. 데이터베이스 & Prisma 설정
- [ ] PostgreSQL 로컬 인스턴스 설정 또는 클라우드 DB 연결
- [ ] Prisma 마이그레이션 실행 (`prisma migrate dev`)
- [ ] Prisma Client 생성 (`prisma generate`)
- [ ] 시드 데이터 스크립트 작성 (`prisma/seed.ts`)
  - [ ] 샘플 사용자 생성
  - [ ] 한국 맞춤 카테고리 데이터 (식비, 교통, 주거, 통신 등)
  - [ ] 샘플 거래 내역 (고정/변동, 수입/지출)

### 1-2. NextAuth 구글 로그인 구현
- [ ] NextAuth 설정 파일 생성 (`lib/auth.ts` or `auth.config.ts`)
- [ ] Google OAuth Provider 설정
- [ ] Prisma Adapter 연결
- [ ] JWT 세션 전략 구성
- [ ] 환경변수 설정 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET)
- [ ] 로그인/로그아웃 API 라우트 구현 (`app/api/auth/[...nextauth]/route.ts`)

### 1-3. 미들웨어 & 인증 보호
- [ ] NextAuth 미들웨어 설정 (`middleware.ts`)
- [ ] 보호된 라우트 정의 (대시보드, 설정 등)
- [ ] 세션 헬퍼 유틸리티 작성 (`lib/auth-utils.ts`)

---

## Phase 2: 코어 유틸리티 & 타입 정의

### 2-1. 타입 시스템 구축
- [ ] Prisma 타입 기반 공통 타입 정의 (`types/index.ts`)
  - [ ] `BaseRow` 인터페이스 (ag-Grid용)
  - [ ] `Row<TExtra>` 제네릭 타입
  - [ ] API Request/Response DTO 타입
  - [ ] `TransactionType`, `PaymentMethod` 등 Enum 타입

### 2-2. Zod 스키마 정의
- [ ] Transaction 생성/수정 스키마 (`lib/validations/transaction.ts`)
- [ ] User 설정 스키마 (`lib/validations/user.ts`)
- [ ] Quick Add Bar 입력 파싱 스키마
- [ ] API 공통 응답 스키마

### 2-3. 급여월(Period) 계산 유틸리티
- [ ] `getPayPeriod()` 함수 구현 (`lib/utils/pay-period.ts`)
  - [ ] salaryDay 기반 시작/종료일 계산
  - [ ] 29/30/31일 예외 처리 (2월, 30일 달 등)
  - [ ] Asia/Seoul 타임존 적용
  - [ ] 월별 라벨 생성 (예: "2025년 10월")
- [ ] 유닛 테스트 작성 (`__tests__/pay-period.test.ts`)
  - [ ] 일반 케이스 (1~28일)
  - [ ] 경계 케이스 (29, 30, 31일)
  - [ ] 2월 처리 (윤년/평년)
  - [ ] 월 경계 넘어가는 케이스

### 2-4. 날짜/통화 포맷팅 유틸리티
- [ ] dayjs 타임존 플러그인 설정
- [ ] 날짜 포맷팅 함수 (`formatDate`, `parseDate`)
- [ ] 통화 포맷팅 함수 (`formatCurrency`)
- [ ] 로케일 기반 숫자 파싱 함수

---

## Phase 3: i18n & 다국어 지원

### 3-1. next-intl 설정
- [ ] next-intl 미들웨어 통합 (`middleware.ts`)
- [ ] 로케일 라우팅 설정 (`/ko`, `/en`)
- [ ] i18n 설정 파일 (`i18n.config.ts`)

### 3-2. 번역 파일 작성
- [ ] 한국어 번역 (`messages/ko.json`)
  - [ ] 공통 UI 텍스트
  - [ ] 카테고리 명칭
  - [ ] 에러 메시지
  - [ ] 온보딩 텍스트
- [ ] 영어 번역 (`messages/en.json`)
  - [ ] 위 항목 영문 번역
- [ ] 카테고리 다국어 사전 (`lib/constants/categories.ts`)

### 3-3. 로케일 감지 & 전환
- [ ] Accept-Language 헤더 파싱
- [ ] 로케일 쿠키 저장/읽기
- [ ] 수동 언어 토글 UI 컴포넌트

---

## Phase 4: API 라우트 구현

### 4-1. 급여월 계산 API
- [ ] `GET /api/period` 구현
  - [ ] `anchorDate` 쿼리 파라미터 검증
  - [ ] salaryDay 사용자 설정 조회
  - [ ] `getPayPeriod()` 호출 및 응답

### 4-2. Transaction CRUD API
- [ ] `GET /api/transactions` 구현
  - [ ] 페이지네이션 (page, pageSize)
  - [ ] 날짜 범위 필터 (start, end)
  - [ ] 검색/정렬 (q, sort)
  - [ ] userId 스코프 적용
- [ ] `POST /api/transactions` 구현
  - [ ] Zod 검증
  - [ ] 고정지출 템플릿 연계 (옵션)
  - [ ] Rate limiting (5req/초)
- [ ] `PUT /api/transactions/:id` 구현
  - [ ] 권한 검증 (userId 일치)
  - [ ] 옵티미스틱 업데이트 지원
- [ ] `DELETE /api/transactions/:id` 구현
  - [ ] 권한 검증
  - [ ] 소프트 삭제 vs 하드 삭제 결정

### 4-3. 통계/요약 API
- [ ] `GET /api/stats/summary` 구현
  - [ ] 날짜 범위 기준 집계
  - [ ] income, expense, saving, balance 계산
  - [ ] 전월 대비 증감 계산
  - [ ] 응답 캐싱 전략

### 4-4. 고정 지출 템플릿 API (선택)
- [ ] `GET /api/fixed-templates` 구현
- [ ] `POST /api/fixed-templates` 구현
- [ ] `PUT /api/fixed-templates/:id` 구현
- [ ] `DELETE /api/fixed-templates/:id` 구현

---

## Phase 5: 입력 파싱 로직

### 5-1. Quick Add Bar 파서 구현
- [ ] `parseQuickInput()` 함수 (`lib/parsers/quick-input.ts`)
  - [ ] 날짜 파싱 (다양한 포맷 지원: `10/05`, `2025-10-05`)
  - [ ] 금액 파싱 (통화 기호, 천 단위 구분자 허용)
  - [ ] 해시태그 파싱 (`#고정`, `#변동`, `#수입`, `#카테고리`)
  - [ ] 설명/메모 추출
  - [ ] 결제수단 파싱
- [ ] 파서 유닛 테스트 (`__tests__/quick-input-parser.test.ts`)
  - [ ] 정상 입력 케이스 (ko/en)
  - [ ] 부분 입력 케이스
  - [ ] 잘못된 입력 케이스
  - [ ] 해시태그 우선순위 테스트

### 5-2. 자동완성 로직
- [ ] 최근 카테고리 추천 알고리즘
- [ ] 자주 쓰는 설명 자동완성
- [ ] Debounce 처리

---

## Phase 6: React Query & 상태 관리

### 6-1. React Query 설정
- [ ] QueryClient 설정 (`lib/query-client.ts`)
- [ ] 전역 Provider 설정 (`app/providers.tsx`)
- [ ] 기본 쿼리 옵션 (staleTime, cacheTime, retry)

### 6-2. 커스텀 훅 작성
- [ ] `useTransactions` - 거래 내역 조회
- [ ] `useCreateTransaction` - 거래 생성 (옵티미스틱)
- [ ] `useUpdateTransaction` - 거래 수정 (옵티미스틱)
- [ ] `useDeleteTransaction` - 거래 삭제
- [ ] `useSummary` - 요약 통계 조회
- [ ] `usePayPeriod` - 급여월 조회
- [ ] 옵티미스틱 업데이트 & 롤백 로직

### 6-3. Zustand 스토어 (경량 UI 상태)
- [ ] 현재 선택된 급여월 상태
- [ ] Quick Add Bar 입력 상태
- [ ] 필터/정렬 UI 상태
- [ ] 언어 토글 상태

---

## Phase 7: UI 컴포넌트 — 공통

### 7-1. shadcn/ui 설치 & 커스터마이징
- [ ] shadcn/ui 초기화
- [ ] 필요한 컴포넌트 설치
  - [ ] Button
  - [ ] Card
  - [ ] Input
  - [ ] Select
  - [ ] Dialog
  - [ ] Toast
  - [ ] Badge/Chip
- [ ] 테마 설정 (light/dark mode 준비)

### 7-2. 레이아웃 컴포넌트
- [ ] RootLayout (`app/layout.tsx`)
  - [ ] next-intl Provider
  - [ ] React Query Provider
  - [ ] NextAuth SessionProvider
- [ ] DashboardLayout (`app/[locale]/dashboard/layout.tsx`)
  - [ ] 헤더 (로그아웃, 언어 토글)
  - [ ] 사이드바 (향후 확장용)
  - [ ] 모바일 반응형

### 7-3. 에러 & 로딩 상태
- [ ] Loading Skeleton 컴포넌트
- [ ] Error Boundary 컴포넌트
- [ ] 404 페이지
- [ ] 500 에러 페이지

---

## Phase 8: UI 컴포넌트 — 가계부 핵심

### 8-1. 온보딩 플로우
- [ ] 온보딩 다이얼로그 컴포넌트
  - [ ] 환영 메시지
  - [ ] 월급일 설정 (1~31 선택)
  - [ ] 통화 설정 (KRW 기본)
  - [ ] 언어 설정 (ko-KR 기본)
- [ ] 첫 로그인 감지 로직
- [ ] 설정 저장 API 연동

### 8-2. Quick Add Bar 컴포넌트
- [ ] 입력 필드 (`components/QuickAddBar.tsx`)
  - [ ] Placeholder 다국어 처리
  - [ ] 실시간 파싱 미리보기
  - [ ] 검증 에러 인라인 표시
- [ ] 타입 토글 UI (고정/변동/수입 라디오)
- [ ] 자동완성 드롭다운
- [ ] 키보드 단축키 (Enter, Shift+Enter)
- [ ] 생성 성공 시 입력 초기화 & 토스트

### 8-3. Progress 카드 (4종)
- [ ] ProgressCard 공통 컴포넌트 (`components/ProgressCard.tsx`)
  - [ ] 제목, 금액, 통화 표시
  - [ ] 전월 대비 증감 % 및 화살표
  - [ ] 간단 스파크라인 (mini chart)
- [ ] Income 카드
- [ ] Expense 카드
- [ ] Saving 카드
- [ ] Balance 카드
- [ ] 카드 그리드 레이아웃 (반응형)

### 8-4. 월별 Chip 내비게이션
- [ ] PeriodChips 컴포넌트 (`components/PeriodChips.tsx`)
  - [ ] 현재 급여월 중앙 정렬
  - [ ] 좌우 스크롤 UI
  - [ ] 키보드 내비게이션 (←→)
  - [ ] 최대 ±24개월 표시
  - [ ] 선택 시 상태 업데이트 & 데이터 리로드
- [ ] 모바일 스와이프 지원

### 8-5. ag-Grid 표 컴포넌트
- [ ] TransactionGrid 컴포넌트 (`components/TransactionGrid.tsx`)
  - [ ] 제네릭 타입 적용 `Row<TExtra>`
  - [ ] 컬럼 정의 (date, type, fixed, category, amount 등)
  - [ ] 인라인 편집 활성화 (editable columns)
  - [ ] 필터링 & 정렬 UI
  - [ ] 그룹핑 (category → subcategory)
  - [ ] Pinned Total Row (급여월 합계)
  - [ ] 다중 선택 & 일괄 삭제
  - [ ] CSV 내보내기 버튼
- [ ] 옵티미스틱 업데이트 연동
- [ ] 에러 시 롤백 & 토스트

---

## Phase 9: 페이지 구성

### 9-1. 인증 페이지
- [ ] 로그인 페이지 (`app/[locale]/login/page.tsx`)
  - [ ] Google 로그인 버튼
  - [ ] 로딩 상태 처리
  - [ ] 로그인 후 리다이렉트

### 9-2. 대시보드 메인 페이지
- [ ] 대시보드 페이지 (`app/[locale]/dashboard/page.tsx`)
  - [ ] Quick Add Bar 배치
  - [ ] Progress 카드 그리드
  - [ ] PeriodChips 배치
  - [ ] TransactionGrid 배치
  - [ ] 로딩/에러 상태 처리

### 9-3. 설정 페이지 (옵션)
- [ ] 설정 페이지 (`app/[locale]/settings/page.tsx`)
  - [ ] 월급일 변경
  - [ ] 통화 변경
  - [ ] 언어 변경
  - [ ] 계정 정보 표시

---

## Phase 10: 테스트 & 품질 보증

### 10-1. 유닛 테스트
- [ ] 급여월 계산 유틸리티 테스트
- [ ] Quick Input 파서 테스트
- [ ] 날짜/통화 포맷팅 함수 테스트
- [ ] Zod 스키마 검증 테스트

### 10-2. 통합 테스트
- [ ] API 라우트 테스트 (Jest + Supertest)
  - [ ] `/api/period` 테스트
  - [ ] `/api/transactions` CRUD 테스트
  - [ ] `/api/stats/summary` 테스트
- [ ] 인증 플로우 테스트

### 10-3. E2E 테스트 (선택적)
- [ ] Playwright 설정
- [ ] 로그인 → 온보딩 → 입력 → 표 확인 플로우
- [ ] 월 전환 시나리오
- [ ] 인라인 편집 시나리오

### 10-4. 접근성(a11y) 테스트
- [ ] 키보드 내비게이션 검증
- [ ] ARIA 레이블 검증
- [ ] 스크린 리더 테스트 (NVDA/JAWS)
- [ ] Lighthouse 접근성 점수 90+ 목표

### 10-5. 성능 테스트
- [ ] Web Vitals 측정 (LCP, FID, CLS)
- [ ] TTFB < 500ms 검증
- [ ] Lighthouse 성능 점수 90+ 목표
- [ ] 대량 데이터 로드 테스트 (1000+ 거래)

---

## Phase 11: 보안 & 규정 준수

### 11-1. 보안 강화
- [ ] CSRF 방지 (NextAuth 자동 처리 확인)
- [ ] XSS 방지 (입력 sanitization)
- [ ] SQL Injection 방지 (Prisma ORM 사용)
- [ ] Rate Limiting 구현 (Vercel/Upstash)
- [ ] HttpOnly 쿠키 설정 확인
- [ ] HTTPS 강제 (프로덕션)

### 11-2. 데이터 프라이버시
- [ ] 개인정보 최소 수집 검증
- [ ] 데이터 삭제 기능 (계정 탈퇴)
- [ ] 데이터 내보내기 기능 (CSV)
- [ ] 개인정보 처리방침 페이지

### 11-3. 로깅 & 감사
- [ ] 주요 이벤트 로깅 (생성/수정/삭제)
- [ ] 감사 로그 테이블 (선택)
- [ ] 에러 로깅 (Sentry 연동 검토)

---

## Phase 12: 배포 & DevOps

### 12-1. 프로덕션 빌드 준비
- [ ] 환경변수 검증 스크립트
- [ ] 빌드 에러 0건 확인
- [ ] TypeScript strict mode 통과
- [ ] ESLint --max-warnings=0 통과
- [ ] 프로덕션 환경 .env 설정

### 12-2. 데이터베이스 배포
- [ ] Vercel Postgres / Render / Railway 선택
- [ ] 프로덕션 DB 마이그레이션 실행
- [ ] Connection Pooling 설정 (Prisma Accelerate 검토)
- [ ] 백업 전략 수립

### 12-3. 웹 애플리케이션 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정 (Vercel Dashboard)
- [ ] 도메인 연결 (선택)
- [ ] HTTPS/SSL 설정
- [ ] 배포 성공 확인

### 12-4. 모니터링 & 분석
- [ ] Vercel Analytics 연동
- [ ] Web Vitals 수집 확인
- [ ] 커스텀 이벤트 트래킹 (거래 생성 등)
- [ ] 에러 모니터링 (Sentry 검토)

---

## Phase 13: 문서화 & 런북

### 13-1. README 작성
- [ ] 프로젝트 소개
- [ ] 기술 스택 명시
- [ ] 로컬 실행 가이드
  - [ ] 의존성 설치 (`pnpm install`)
  - [ ] 환경변수 설정 (`.env` 복사)
  - [ ] DB 마이그레이션 (`pnpm db:migrate`)
  - [ ] 시드 데이터 (`pnpm db:seed`)
  - [ ] 개발 서버 실행 (`pnpm dev`)
- [ ] 배포 가이드
- [ ] 주요 기능 스크린샷

### 13-2. API 문서
- [ ] API 엔드포인트 명세 (OpenAPI/Swagger 검토)
- [ ] Request/Response 예시
- [ ] 에러 코드 정리

### 13-3. 컴포넌트 문서
- [ ] 주요 컴포넌트 Props 설명
- [ ] 사용 예시 코드

---

## Phase 14: 수락 기준 최종 검증

### 14-1. 기능 체크리스트
- [ ] Quick Add Bar 해시태그/토글 입력 성공
- [ ] 날짜/금액/카테고리 파싱 정확도 95% 이상
- [ ] 급여월 31일/2월 경계 케이스 통과
- [ ] ag-Grid 인라인 편집 서버 반영 (500ms 내)
- [ ] CSV 내보내기 동작
- [ ] Progress 카드 정확한 값 표시
- [ ] 전월 대비 증감 % 정확
- [ ] Google 로그인 → 온보딩 → 대시보드 플로우 성공
- [ ] 월 Chip 전환 시 표/카드 동기화
- [ ] i18n ko/en 토글 및 포맷 정상

### 14-2. 비기능 요구사항 체크
- [ ] TTFB < 500ms (로컬)
- [ ] LCP < 2.5s (목표)
- [ ] 키보드 내비게이션 동작
- [ ] 모바일 반응형 (≥360px)
- [ ] a11y: ARIA 레이블, 스크린 리더 호환

### 14-3. 보안 체크
- [ ] CSRF/XSS 방지 확인
- [ ] Rate limiting 동작
- [ ] HttpOnly 쿠키 설정
- [ ] Row-Level 권한 검증 (userId 스코프)

---

## Phase 15: 향후 확장 준비 (v0.2+)

### 15-1. 아키텍처 메모
- [ ] 타이머 모듈 스켈레톤 코드
- [ ] 커뮤니티 모듈 데이터 모델 초안
- [ ] 스케줄러 Google Calendar API 연동 검토

### 15-2. 기술 부채 정리
- [ ] TODO 주석 정리
- [ ] 사용하지 않는 코드 제거
- [ ] 리팩토링 우선순위 목록 작성

---

## 완료 기준 체크리스트 (모든 Phase 완료 후)

- [ ] 로컬에서 Google OAuth → 온보딩 → 입력바 → 표 → 카드 → 월칩 전체 플로우 성공
- [ ] 급여월 경계 테스트 (31일/2월) 통과
- [ ] ag-Grid 인라인 편집 서버 반영 및 CSV 내보내기 확인
- [ ] i18n ko/en 토글 및 포맷 정상
- [ ] `eslint --max-warnings=0` 통과
- [ ] `tsc --noEmit` 통과 (타입 체크)
- [ ] 프로덕션 배포 성공 (Vercel)
- [ ] README 및 문서 완성

---

**총 예상 작업 기간**: 2-3주 (1인 풀타임 기준)

**우선순위**:
1. Phase 1-4 (인프라 & API) — 필수
2. Phase 5-8 (파싱 & UI 핵심) — 필수
3. Phase 9-10 (페이지 & 테스트) — 필수
4. Phase 11-13 (보안 & 배포 & 문서) — 권장
5. Phase 14-15 (검증 & 확장 준비) — 선택적

**마일스톤**:
- M1 (1주): Phase 1-4 완료 → API 동작 확인
- M2 (2주): Phase 5-9 완료 → UI 통합 완료
- M3 (3주): Phase 10-14 완료 → 배포 & 검증 완료
