# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Dashboard v0.1 — 월급일 기준 가계부 관리 서비스. 사용자가 설정한 월급일을 anchor로 급여월(Period)을 계산하여 수입/지출을 관리하는 SaaS 애플리케이션입니다.

**핵심 비즈니스 로직**:
- 사용자별 `salaryDay` (1-31) 기준으로 급여월 계산
- 해시태그 기반 Quick Add Bar (`#고정 #변동 #수입 #카테고리`)
- 고정/변동 지출 구분 및 정기 템플릿 관리
- ag-Grid 기반 거래 내역 관리 (인라인 편집, 집계, CSV 내보내기)

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript (Strict Mode)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (Google OAuth, JWT 세션)
- **UI**: Tailwind CSS + shadcn/ui, ag-Grid Community
- **State**: React Query (서버), Zustand (클라이언트)
- **Validation**: Zod (전 구간 검증)
- **i18n**: next-intl (ko-KR, en-US)
- **Date**: dayjs (Asia/Seoul timezone)

## Development Commands

```bash
# 개발 환경
pnpm dev              # Next.js 개발 서버 (http://localhost:3000)
pnpm lint             # ESLint 검사
pnpm type-check       # TypeScript 타입 체크 (빌드 전 필수)

# 테스트
pnpm test             # Jest 유닛 테스트 실행
pnpm test:watch       # Jest watch 모드

# 데이터베이스
pnpm db:generate      # Prisma Client 생성 (스키마 변경 후)
pnpm db:migrate       # 마이그레이션 생성 및 적용 (개발 환경)
pnpm db:seed          # 시드 데이터 입력
pnpm db:studio        # Prisma Studio GUI
pnpm db:reset         # DB 완전 초기화 (Docker 재시작 + 마이그레이션 + 시드)

# Docker (로컬 개발)
pnpm docker:dev       # Docker Compose로 PostgreSQL + App 시작
pnpm docker:down      # Docker Compose 중지
pnpm docker:logs      # App 로그 확인
pnpm docker:build     # 프로덕션 이미지 빌드
pnpm docker:test      # 빌드된 이미지 로컬 테스트

# 프로덕션
pnpm build            # Next.js 프로덕션 빌드
pnpm start            # 프로덕션 서버 실행
```

## Architecture & Key Patterns

### Database Schema (Prisma)

**핵심 모델**:
- `User`: 사용자 정보 + 급여일(`salaryDay`), 통화(`currency`), 언어(`locale`) 설정
- `Transaction`: 거래 내역 (`type`: income/expense, `fixed`: 고정 여부, `recurrence`: RRULE)
- `FixedExpenseTemplate`: 정기 지출 템플릿 (매월/매주 자동 생성용)
- NextAuth 테이블: `Account`, `Session`, `VerificationToken`

**중요**:
- Prisma Client는 `app/generated/prisma`로 출력됨 (schema.prisma의 output 설정)
- User.id는 String (cuid) 타입 - NextAuth 호환성을 위함
- 모든 거래는 userId 스코프로 격리 (Row-Level Security 패턴)

### Actual Directory Structure

```
app/
├── [locale]/              # i18n 라우팅 (/ko, /en)
│   ├── dashboard/         # 메인 대시보드 (로그인 필수)
│   │   ├── page.tsx       # 대시보드 메인 (클라이언트 컴포넌트)
│   │   ├── layout.tsx     # 인증 확인 + DashboardHeader
│   │   ├── loading.tsx    # DashboardSkeleton
│   │   └── error.tsx      # ErrorFallback
│   ├── login/             # 로그인 페이지
│   │   └── page.tsx       # Google OAuth 버튼
│   ├── settings/          # 사용자 설정
│   │   └── page.tsx       # 월급일/통화/언어 변경
│   ├── layout.tsx         # NextIntlClientProvider
│   └── error.tsx          # 전역 에러
├── api/
│   ├── auth/              # NextAuth 인증
│   │   └── [...nextauth]/ # NextAuth 핸들러
│   ├── transactions/      # 거래 CRUD
│   │   └── [id]/          # 거래 수정/삭제
│   ├── period/            # 급여월 계산 API
│   ├── stats/             # 통계 요약
│   │   └── summary/       # income, expense, saving, balance
│   └── health/            # Health check (Render 배포용)
├── layout.tsx             # RootLayout (Providers + Toaster)
├── page.tsx               # 루트 → /ko/dashboard 리다이렉트
└── providers.tsx          # QueryClientProvider + SessionProvider

components/
├── QuickAddBar.tsx        # 해시태그 파서 기반 빠른 입력 + 실시간 미리보기
├── ProgressCard.tsx       # 4종 카드 (ProgressCardGrid 포함)
├── PeriodChips.tsx        # 월별 칩 내비게이션 (±24개월, 키보드 지원)
├── TransactionGrid.tsx    # ag-Grid 래퍼 (인라인 편집, CSV 내보내기)
├── OnboardingDialog.tsx   # 첫 로그인 온보딩 (월급일/통화/언어 설정)
├── DashboardHeader.tsx    # 헤더 (언어 토글, 로그아웃 드롭다운)
├── LoadingSkeleton.tsx    # 로딩 스켈레톤들 (Dashboard, Table, Card)
├── ErrorBoundary.tsx      # 에러 처리 컴포넌트
└── ui/                    # shadcn/ui 컴포넌트들

hooks/
├── use-transactions.ts    # 거래 CRUD 훅 (옵티미스틱 업데이트)
├── use-stats.ts           # 통계 요약 훅 (useSummary)
├── use-pay-period.ts      # 급여월 계산 훅
└── use-user-settings.ts   # 사용자 설정 CRUD 훅

store/                     # Zustand 클라이언트 상태
├── use-period-store.ts    # 선택된 급여월 (localStorage)
├── use-quick-add-store.ts # Quick Add Bar 입력 상태
├── use-filter-store.ts    # 필터/정렬 UI 상태 (localStorage)
└── use-locale-store.ts    # 언어 설정 (localStorage)

lib/
├── auth.ts                # NextAuth 설정 (Google Provider, Prisma Adapter)
├── prisma.ts              # Prisma Client 싱글톤
├── query-client.ts        # React Query 전역 설정
├── validations/           # Zod 스키마 (transaction, user, API 응답)
├── utils/
│   └── pay-period.ts      # getPayPeriod(anchorDate, salaryDay, tz)
└── parsers/
    └── quick-input.ts     # parseQuickInput(raw, locale) - 해시태그 파싱

i18n/
├── request.ts             # next-intl 설정
└── routing.ts             # 라우팅 정의 (ko/en, defaultLocale)

messages/
├── ko.json                # 한국어 번역
└── en.json                # 영어 번역

types/
└── index.ts               # BaseRow, Row<TExtra>, API DTO 타입

__tests__/
└── quick-input-parser.test.ts  # Quick Input 파서 테스트 (29/29 통과)
```

### Critical Business Logic

#### 1. Pay Period Calculation (`lib/utils/pay-period.ts`)

```typescript
// 급여월 계산: salaryDay를 기준으로 당월 시작/종료일 산출
// 엣지 케이스: 29/30/31일 설정 시 월별 마지막 날로 보정 (2월 대응)
function getPayPeriod(anchorDate: string, salaryDay: number, tz = 'Asia/Seoul') {
  // 반환: { startISO, endISO, label }
  // 예: salaryDay=25 → 25일 00:00 ~ 익월 24일 23:59:59
}
```

**테스트 필수**: 31일 설정 + 2월, 윤년/평년, 월 경계 케이스.

#### 2. Quick Add Bar Parser (`lib/parsers/quick-input.ts`)

```typescript
// 입력 예시 (ko): "10/05 점심 9,000원 #변동 #식비 카드 메모"
// 파싱 결과: { date, amount, type, fixed, category, description, tags, paymentMethod }
function parseQuickInput(raw: string, locale: 'ko' | 'en'): ParsedInput {
  // 1. 해시태그 추출 및 제거
  // 2. type & fixed 파싱 (해시태그 우선 → fallback 파라미터)
  // 3. 날짜 파싱 (MM/DD, YYYY-MM-DD, 오늘/어제/내일)
  // 4. 금액 파싱 (만원/천원 단위, 쉼표 구분, 음수 필터링)
  // 5. 결제수단 파싱 (카드/현금/이체)
  // 6. 카테고리 파싱 (해시태그에서만)
  // 7. 남은 텍스트 → description
}
```

**중요 구현 세부사항**:
- **한글 정규식**: `\b` word boundary가 한글에 작동하지 않음 → 조건부 regex 사용
- **금액 단위**: "10만원" → 100000, "5천원" → 5000
- **음수 필터링**: "-10000원"은 파싱하지 않음 (에러 방지)
- **카테고리**: 해시태그에서만 파싱 (description에서 제거 방지)
- **테스트 커버리지**: 29개 테스트 케이스 (ko/en, 엣지 케이스)

#### 3. ag-Grid Generic Row Type

```typescript
// 공통 베이스 (확장 가능한 제네릭 설계)
export interface BaseRow {
  id: number;
  date: string; // ISO
  type: 'income' | 'expense';
  fixed: boolean;
  category: string;
  amount: number;
  // ...
}

export type Row<TExtra extends object = {}> = BaseRow & TExtra;

// 사용 예: Row<{ notes?: string }>
```

### State Management Architecture

**React Query (서버 상태)**:
- `staleTime`: 5분 (fresh 데이터 유지)
- `gcTime`: 30분 (캐시 보관)
- **Optimistic Updates**: 모든 mutation에 적용 (create, update, delete)
- **Rollback**: 에러 시 이전 상태 복원
- **Invalidation**: 성공 시 관련 쿼리 무효화 (transactions, stats, payPeriod)
- **Devtools**: 개발 환경에서만 활성화

**Zustand (클라이언트 상태)**:
- **Persist Middleware**: localStorage 영속화 (period, filter, locale)
- **No Persist**: Quick Add Bar 입력 상태 (휘발성)
- **Selector Pattern**: 필요한 상태만 구독하여 리렌더링 최소화

**Key Hooks**:
- `useTransactions()`: 페이지네이션, 필터링, 정렬
- `useCreateTransaction()`: 옵티미스틱 생성 + 롤백
- `useUpdateTransaction()`: 옵티미스틱 수정 + 롤백
- `useDeleteTransaction()`: 옵티미스틱 삭제 + 롤백
- `useSummary()`: 급여월 통계 (income, expense, saving, balance)
- `usePayPeriod()`: 급여월 계산 (staleTime 1시간)
- `useUserSettings()`: 사용자 설정 (salaryDay, currency, locale)

### API Design Principles

- **Zod 전 구간 검증**: Request DTO, Response DTO 모두 스키마 선언
- **표준 에러 응답**: `{ code, message, fieldErrors }`
- **Row-Level 권한**: 모든 쿼리에 `userId` 스코프 적용 (NextAuth 세션에서 추출)
- **Pagination**: `{ items: T[], meta: { totalCount, page, pageSize } }` 구조
- **Rate Limiting**: `POST /api/transactions` 초당 5req 제한 (구현 예정)

### i18n Strategy

- **Route-based**: `/[locale]/` 패턴 (next-intl)
- **우선순위**: 수동 설정 > 쿠키 > Accept-Language
- **타임존**: Asia/Seoul 고정 (서버/클라이언트 공통)
- **카테고리 사전**: `lib/constants/categories.ts`에서 locale별 번역

## Docker & Deployment

### Local Development

**Docker Compose** (로컬 전용):
```bash
docker-compose up -d          # PostgreSQL + Next.js 앱
docker-compose exec app pnpm db:migrate
docker-compose exec app pnpm db:seed
```

### Production Deployment (Render)

**주의**: Render는 Docker Compose 미지원. `render.yaml` Blueprint 사용.

**배포 전략**:
1. **1순위**: Render Blueprint (`render.yaml` + `Dockerfile`)
   - DB + App 한 번에 배포, IaC 방식
2. **2순위**: Render Manual Docker (Dockerfile 직접 빌드)
3. **3순위**: Vercel (표준 Next.js 빌드, Docker 미사용)

**Dockerfile 요구사항**:
- Multi-stage build (dependencies → builder → runner)
- Next.js standalone mode (`output: 'standalone'`)
- Prisma Client 생성 포함
- Health check 엔드포인트 (`/api/health`)

**render.yaml 구조**:
```yaml
services:
  - type: web
    name: personal-dash
    env: docker
    dockerfilePath: ./Dockerfile
    # ...

databases:
  - name: personal-dash-db
    plan: free
```

## Testing Requirements

- **Unit Tests**: `getPayPeriod()`, `parseQuickInput()`, 날짜/통화 포맷팅
- **Integration Tests**: API 라우트 (Jest + Supertest)
- **E2E**: 로그인 → 온보딩 → 입력바 → 표 확인 (Playwright, 선택적)
- **a11y**: 키보드 내비게이션, ARIA 레이블, Lighthouse 90+ 목표

## Security & Compliance

- **CSRF/XSS**: NextAuth 자동 처리 확인, 입력 sanitization
- **Rate Limiting**: Vercel/Upstash 또는 Render 레벨
- **Secrets**: `.env` 파일은 절대 커밋 금지, `.env.example`만 버전 관리
- **Privacy**: 개인정보 최소 수집, 삭제/내보내기 기능 필수 (PIPA/GDPR 대비)

## Code Quality Standards

- **TypeScript**: Strict mode, `tsc --noEmit` 통과 필수
- **ESLint**: `eslint --max-warnings=0` 통과
- **Prettier**: 코드 포맷팅 일관성
- **Commits**: 한국어 커밋 메시지 사용, Co-Authored-By: Claude 포함

## Implementation Phases

**현재 상태**: Phase 0-11 완료 (총 15개 Phase 중 12개, 80%)

**완료된 Phase**:
- ✅ Phase 0: 프로젝트 초기 설정
- ✅ Phase 0.5: Docker 환경 구성
- ✅ Phase 1: 인프라 & 인증 (NextAuth + Google OAuth)
- ✅ Phase 2: 코어 유틸리티 & 타입 정의
- ✅ Phase 3: i18n & 다국어 지원 (next-intl)
- ✅ Phase 4: API 라우트 구현 (CRUD + 통계 + 급여월)
- ✅ Phase 5: Quick Add Bar 파서 (29/29 테스트 통과)
- ✅ Phase 6: React Query & Zustand 상태 관리
- ✅ Phase 7: 공통 UI 컴포넌트 (shadcn/ui + 레이아웃 + 에러 처리)
- ✅ Phase 8: 가계부 핵심 컴포넌트 (온보딩, QuickAddBar, ProgressCard, PeriodChips, TransactionGrid)
- ✅ Phase 9: 페이지 구성 (대시보드, 설정)
- ✅ Phase 10: 테스트 & 품질 보증 (93개 테스트 통과)
- ✅ Phase 11: 보안 & 규정 준수 (Rate Limiting, XSS 방지, Audit Logging, 계정 삭제, HttpOnly 쿠키)

**남은 Phase**:
- ⏳ Phase 12: 배포 & DevOps
- ⏳ Phase 13: 문서화
- ⏳ Phase 14: 최종 검증
- ⏳ Phase 15: 향후 확장 준비

상세 계획은 `prompts/init.md` 참조 (Phase별 체크리스트).

## Important Notes

1. **급여월 경계 케이스**: 29/30/31일 설정 시 월별 마지막 날로 보정 로직 필수
2. **Prisma Client 위치**: `app/generated/prisma`에서 import (schema.prisma의 output 설정)
3. **환경변수 필수**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`
4. **NextAuth v5**: Beta 버전 사용 중, breaking changes 주의 - User.id는 String (cuid) 타입
5. **ag-Grid 라이선스**: Community Edition (상용 기능 제한, 인라인 편집/필터링/정렬만)
6. **타임존**: 모든 날짜 연산은 Asia/Seoul 기준 (서버/클라이언트 동일)
7. **한국어 커밋**: 모든 커밋 메시지는 한국어로 작성, `Co-Authored-By: Claude` 포함
8. **클라이언트 컴포넌트**: 대시보드/설정 페이지는 'use client' (hooks 사용)
9. **서버 컴포넌트**: 레이아웃은 서버 컴포넌트 (세션 확인, 인증 체크)
10. **Optimistic Updates**: 모든 mutation은 옵티미스틱 업데이트 + 롤백 패턴 적용

## References

- [구현 계획](./prompts/init.md) - Phase별 체크리스트
- [README.md](./README.md) - 프로젝트 개요 및 실행 가이드
- [Prisma Schema](./prisma/schema.prisma) - DB 스키마 정의
