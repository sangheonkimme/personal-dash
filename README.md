# 개인 대시보드 (Personal Dashboard) v0.1 — 가계부

월급일 기준 가계부 관리 서비스. Next.js 15, Prisma, NextAuth, ag-Grid 기반.

## 🚀 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript (Strict Mode)
- **데이터베이스**: PostgreSQL + Prisma ORM
- **인증**: NextAuth v5 (Google OAuth)
- **UI**: Tailwind CSS + shadcn/ui
- **그리드**: ag-Grid Community
- **상태 관리**: React Query + Zustand
- **검증**: Zod
- **i18n**: next-intl
- **날짜**: dayjs (timezone)

## 📋 주요 기능

### v0.1 (현재)
- ✅ **Google 로그인** — OAuth 2.0 인증
- ✅ **Quick Add Bar** — 해시태그 기반 빠른 입력 (`#고정 #변동 #수입 #카테고리`)
- ✅ **월급일 기반 급여월 조회** — 사용자별 월급일(1~31) 설정
- ✅ **4가지 Progress 카드** — 수입/지출/저축/잔액 요약
- ✅ **ag-Grid 표** — 인라인 편집, 정렬, 필터, 그룹핑, CSV 내보내기
- ✅ **월별 Chip 내비게이션** — 급여월 간 빠른 전환
- ✅ **다국어 지원** — 한국어/영어 (ko-KR, en-US)

### 향후 계획 (v0.2+)
- 타이머 모듈 (집중/휴식 타임 트래킹)
- 커뮤니티 모듈 (익명 게시판)
- 스케줄러 모듈 (Google Calendar 연동)

## 🛠️ 로컬 실행 가이드

### 1. 사전 요구사항
- Node.js 20+
- pnpm (권장) 또는 npm
- PostgreSQL 14+

### 2. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd personal-dash

# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일 편집 (DATABASE_URL, GOOGLE_CLIENT_ID 등)
```

### 3. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 및 OAuth 2.0 클라이언트 ID 생성
3. Authorized redirect URIs 추가:
   - `http://localhost:3000/api/auth/callback/google`
4. 클라이언트 ID와 Secret을 `.env`에 설정

### 4. 데이터베이스 설정

```bash
# Prisma 마이그레이션
pnpm db:migrate

# 시드 데이터 (선택)
pnpm db:seed
```

### 5. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📦 주요 스크립트

```bash
pnpm dev            # 개발 서버 실행
pnpm build          # 프로덕션 빌드
pnpm start          # 프로덕션 서버 실행
pnpm lint           # ESLint 검사
pnpm type-check     # TypeScript 타입 체크
pnpm db:generate    # Prisma Client 생성
pnpm db:migrate     # DB 마이그레이션
pnpm db:seed        # 시드 데이터 입력
pnpm db:studio      # Prisma Studio 실행
```

## 🗂️ 프로젝트 구조

```
personal-dash/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n 라우팅
│   │   ├── dashboard/     # 대시보드 페이지
│   │   ├── login/         # 로그인 페이지
│   │   └── settings/      # 설정 페이지
│   └── api/               # API Routes
│       ├── auth/          # NextAuth
│       ├── transactions/  # 거래 CRUD
│       ├── period/        # 급여월 계산
│       └── stats/         # 통계 요약
├── components/            # React 컴포넌트
│   ├── QuickAddBar.tsx
│   ├── ProgressCard.tsx
│   ├── PeriodChips.tsx
│   └── TransactionGrid.tsx
├── lib/                   # 유틸리티 & 설정
│   ├── auth.ts           # NextAuth 설정
│   ├── prisma.ts         # Prisma Client
│   ├── validations/      # Zod 스키마
│   ├── utils/            # 헬퍼 함수
│   └── parsers/          # Quick Input 파서
├── prisma/
│   ├── schema.prisma     # DB 스키마
│   └── seed.ts           # 시드 스크립트
├── messages/             # i18n 번역 파일
│   ├── ko.json
│   └── en.json
├── types/                # TypeScript 타입 정의
└── __tests__/            # 테스트 파일
```

## 🌐 환경변수 (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/personal_dash"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32 출력값>"

# Google OAuth
GOOGLE_CLIENT_ID="<Google Console에서 발급>"
GOOGLE_CLIENT_SECRET="<Google Console에서 발급>"

# App
NODE_ENV="development"
```

## 🧪 테스트

```bash
# 유닛 테스트
pnpm test

# E2E 테스트 (선택)
pnpm test:e2e

# 커버리지
pnpm test:coverage
```

## 🚢 배포

### Vercel (권장)

1. Vercel 프로젝트 생성
2. GitHub 저장소 연결
3. 환경변수 설정 (DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_*)
4. 자동 배포

### 데이터베이스 호스팅

- Vercel Postgres
- Render PostgreSQL
- Railway
- Cloudtype

## 📚 추가 문서

- [구현 계획 (Phase별)](./prompts/init.md)
- [API 명세](./docs/api.md) (예정)
- [컴포넌트 가이드](./docs/components.md) (예정)

## 🤝 기여

이슈 및 PR 환영합니다!

## 📄 라이선스

MIT License

---

**제작**: Personal Dashboard Team
**버전**: 0.1.0
**최종 수정**: 2025-10-06
