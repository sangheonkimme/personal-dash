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

# 데이터베이스
pnpm db:generate      # Prisma Client 생성 (스키마 변경 후)
pnpm db:migrate       # 마이그레이션 생성 및 적용 (개발 환경)
pnpm db:seed          # 시드 데이터 입력
pnpm db:studio        # Prisma Studio GUI

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

**중요**: Prisma Client는 `app/generated/prisma`로 출력됨 (schema.prisma의 output 설정).

### Planned Directory Structure (prompts/init.md 참조)

```
app/
├── [locale]/              # i18n 라우팅 (/ko, /en)
│   ├── dashboard/         # 메인 대시보드 (로그인 필수)
│   ├── login/             # 로그인 페이지
│   └── settings/          # 사용자 설정 (salaryDay, currency, locale)
└── api/
    ├── auth/              # NextAuth 인증
    ├── transactions/      # 거래 CRUD
    ├── period/            # 급여월 계산 API
    ├── stats/             # 통계 요약 (income, expense, saving, balance)
    └── health/            # Health check (Render 배포용)

components/
├── QuickAddBar.tsx        # 해시태그 파서 기반 빠른 입력
├── ProgressCard.tsx       # 4종 카드 (수입/지출/저축/잔액)
├── PeriodChips.tsx        # 월별 내비게이션 (±24개월)
└── TransactionGrid.tsx    # ag-Grid 래퍼 (제네릭 Row<TExtra> 타입)

lib/
├── auth.ts                # NextAuth 설정 (Google Provider, Prisma Adapter)
├── prisma.ts              # Prisma Client 싱글톤
├── validations/           # Zod 스키마 (transaction, user, API 응답)
├── utils/
│   └── pay-period.ts      # getPayPeriod(anchorDate, salaryDay, tz) - 핵심 로직
└── parsers/
    └── quick-input.ts     # parseQuickInput(raw, locale) - 해시태그 파싱

messages/
├── ko.json                # 한국어 번역
└── en.json                # 영어 번역

types/
└── index.ts               # BaseRow, Row<TExtra>, API DTO 타입
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
  // 해시태그 우선 → 토글 값 fallback
  // 날짜/금액/카테고리 정규식 추출
}
```

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

### API Design Principles

- **Zod 전 구간 검증**: Request DTO, Response DTO 모두 스키마 선언
- **표준 에러 응답**: `{ code, message, fieldErrors }`
- **Row-Level 권한**: 모든 쿼리에 `userId` 스코프 적용 (NextAuth 세션에서 추출)
- **Rate Limiting**: `POST /api/transactions` 초당 5req 제한

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

현재 상태: **Phase 0 완료** (프로젝트 초기 설정)

다음 단계: **Phase 0.5** (Docker 환경 구성) → **Phase 1** (인프라 & 인증)

상세 계획은 `prompts/init.md` 참조 (Phase 0-15, 460+ 체크리스트).

## Important Notes

1. **급여월 경계 케이스**: 29/30/31일 설정 시 월별 보정 로직 필수
2. **Prisma Client 위치**: `app/generated/prisma`에서 import
3. **환경변수 필수**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`
4. **NextAuth v5**: Beta 버전 사용 중, breaking changes 주의
5. **ag-Grid 라이선스**: Community Edition (상용 기능 제한)
6. **타임존**: 모든 날짜 연산은 Asia/Seoul 기준

## References

- [구현 계획](./prompts/init.md) - Phase별 체크리스트
- [README.md](./README.md) - 프로젝트 개요 및 실행 가이드
- [Prisma Schema](./prisma/schema.prisma) - DB 스키마 정의
