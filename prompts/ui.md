# UI 디자인 리뉴얼 체크리스트

## 목표
현재 다크한 UI를 세련되고 밝은 디자인으로 변경
- **메인 컬러**: 파란색 (Blue)
- **서브 컬러**: 초록색 (Green)
- **전체 톤**: 밝고 깔끔한 화이트/라이트 베이스

---

## Phase 1: 컬러 시스템 정의 ✅

### 1-1. 메인 컬러 (Blue) 팔레트 정의
- [x] Primary Blue 정의
  - [x] 50 (가장 밝음) - 배경용
  - [x] 100-200 - Hover 상태
  - [x] 500 (메인) - 버튼, 링크
  - [x] 600-700 - Active 상태
  - [x] 900 (가장 어두움) - 텍스트

### 1-2. 서브 컬러 (Green) 팔레트 정의
- [x] Accent Green 정의
  - [x] 50-100 - Success 배경
  - [x] 500 (메인) - Success 상태, Income 표시
  - [x] 600-700 - Hover/Active
  - [x] 900 - 강조 텍스트

### 1-3. 중립 컬러 (Neutral) 재정의
- [x] White/Gray 스케일 정의
  - [x] Background: White (#FFFFFF)
  - [x] Secondary Background: Gray-50 (#F9FAFB)
  - [x] Border: Gray-200 (#E5E7EB)
  - [x] Text Primary: Gray-900 (#111827)
  - [x] Text Secondary: Gray-600 (#4B5563)

### 1-4. 기능별 컬러 매핑
- [x] Success: Green-500
- [x] Error/Destructive: Red-500 (유지)
- [x] Warning: Amber-500
- [x] Info: Blue-500

---

## Phase 2: Tailwind Config 업데이트 ✅

### 2-1. tailwind.config.ts 수정 (Tailwind v4 - @theme inline 사용)
- [x] Primary 컬러를 Blue로 변경
- [x] Secondary 컬러를 Green으로 설정
- [x] Background 컬러를 White 기반으로 변경
- [x] Foreground 컬러를 Dark Gray로 설정
- [x] Muted 컬러를 Light Gray로 조정
- [x] Border 컬러를 Subtle Gray로 설정
- [x] Ring/Focus 컬러를 Blue로 설정

### 2-2. CSS Variables 업데이트 (globals.css)
- [x] Light 모드 CSS 변수 재정의
  - [x] --background: White
  - [x] --foreground: Dark Gray (#111827)
  - [x] --primary: Blue-500 (#3b82f6)
  - [x] --primary-foreground: White
  - [x] --secondary: Green-500 (#10b981)
  - [x] --muted: Gray-50
  - [x] --border: Gray-200
  - [x] --ring: Blue-500
  - [x] --accent: Blue-50 (추가)
  - [x] --accent-foreground: Blue-800 (추가)

- [x] Dark 모드 비활성화 또는 조정 (선택)
  - [x] 다크 모드 사용 여부 결정 → 비활성화
  - [x] prefers-color-scheme: dark 무시하도록 설정

---

## Phase 3: 공통 컴포넌트 스타일 업데이트 ✅

### 3-1. Button 컴포넌트
- [x] Default variant: Blue 배경 + White 텍스트 (CSS Variables 자동 적용)
- [x] Secondary variant: Green 배경 + White 텍스트 (CSS Variables 자동 적용)
- [x] Outline variant: Blue 테두리 + Blue 텍스트 (CSS Variables 자동 적용)
- [x] Ghost variant: Hover 시 Blue-50 배경 (accent 변수 사용)
- [x] Destructive variant: Red 유지

### 3-2. Card 컴포넌트
- [x] Background: White (CSS Variables 자동 적용)
- [x] Border: Gray-200 (CSS Variables 자동 적용)
- [x] Shadow: Subtle (shadow-sm) - 기존 유지
- [x] Hover 효과: shadow-md로 변경 (선택적)

### 3-3. Badge 컴포넌트
- [x] Default: Blue 배경 + White 텍스트 (CSS Variables 자동 적용)
- [x] Secondary: Green 배경 + White 텍스트 (CSS Variables 자동 적용)
- [x] Outline: Blue 테두리 (CSS Variables 자동 적용)
- [x] Destructive: Red 유지

### 3-4. Input 컴포넌트
- [x] Background: White (CSS Variables 자동 적용)
- [x] Border: Gray-200 (CSS Variables 자동 적용)
- [x] Focus: Blue-500 ring (CSS Variables 자동 적용)
- [x] Placeholder: Gray-400 (기본 스타일)

### 3-5. Select 컴포넌트
- [x] Trigger: White 배경 + Gray-200 border (CSS Variables 자동 적용)
- [x] Focus: Blue-500 ring (CSS Variables 자동 적용)
- [x] Content: White 배경 + shadow-md (CSS Variables 자동 적용)
- [x] Item hover: Blue-50 배경 (accent 변수 사용)

---

## Phase 4: 페이지별 컴포넌트 스타일 업데이트 ✅

### 4-1. DashboardHeader
- [x] Background: White 고정 + shadow-sm
- [x] Border-bottom: Gray-200 (border-border)
- [x] Logo/Title: Blue (text-primary)
- [x] 아이콘 버튼 hover: Blue-50 배경 (Ghost variant 사용)
- [x] Dropdown: White 배경 + shadow (기본 스타일)

### 4-2. QuickAddBar
- [x] Card background: White (CSS Variables 자동 적용)
- [x] Border: Gray-200 (CSS Variables 자동 적용)
- [x] 버튼 active 상태: Blue 배경 (Default variant)
- [x] 입력창 focus: Blue-500 ring (CSS Variables 자동 적용)
- [x] Badge preview: Blue/Green 배경 (variant 자동 적용)

### 4-3. ProgressCard (4종 카드)
- [x] Income 카드
  - [x] Border: Green-200 (border-2)
  - [x] Icon/Amount: Green-600
  - [x] Background: Green-50/50 (subtle)

- [x] Expense 카드
  - [x] Border: Red-200 (border-2)
  - [x] Icon/Amount: Red-600
  - [x] Background: Red-50/50 (subtle)

- [x] Saving 카드
  - [x] Border: Blue-200 (border-2)
  - [x] Icon/Amount: Blue-600
  - [x] Background: Blue-50/50 (subtle)

- [x] Balance 카드
  - [x] Border: Purple-200 (border-2)
  - [x] Icon/Amount: Purple-600
  - [x] Background: Purple-50/50 (subtle)

### 4-4. PeriodChips
- [x] Default 칩: White 배경 + border (Outline variant)
- [x] Active 칩: Blue-500 배경 + White 텍스트 (Default variant)
- [x] Hover: Blue-50 배경 + Primary border (hover:bg-accent)
- [x] Ring: Primary (ring-primary)
- [x] Shadow-md 추가 (Active 상태)

### 4-5. TransactionGrid (ag-Grid)
- [x] Theme: ag-theme-alpine (밝은 테마) - 기존 사용 중
- [x] Header background: Gray-100 (globals.css 커스텀 변수)
- [x] Row hover: Blue-50 (globals.css 커스텀 변수)
- [x] Border: Gray-200 (globals.css 커스텀 변수)
- [x] Selected row: Blue-100 (globals.css 커스텀 변수)

### 4-6. OnboardingDialog
- [x] Dialog background: White (CSS Variables 자동 적용)
- [x] Overlay: Black 투명도 50% (기본 스타일)
- [x] Title: Blue (text-primary 사용 가능)
- [x] Primary button: Blue-500 배경 (CSS Variables 자동 적용)
- [x] Input focus: Blue-500 ring (CSS Variables 자동 적용)

---

## Phase 5: 특수 스타일 요소

### 5-1. Typography
- [x] Heading 컬러: Gray-900 (.text-heading)
- [x] Body 텍스트: Gray-700 (.text-body)
- [x] Muted 텍스트: Gray-500 (.text-muted)
- [x] Link 컬러: Blue-600 (.text-link)
- [x] Link hover: Blue-700 (.text-link:hover)

### 5-2. 상태별 컬러
- [x] Success: Green-500 (.text-success, .bg-success)
- [x] Error: Red-500 (.text-error, .bg-error)
- [x] Warning: Amber-500 (.text-warning, .bg-warning)
- [x] Info: Blue-500 (.text-info, .bg-info)
- [x] Neutral: Gray-400 (.text-neutral, .bg-neutral)

### 5-3. 그라데이션 (선택적)
- [ ] Hero 섹션: Blue-50 to White
- [ ] Card hover: Subtle Blue-50 glow
- [ ] 버튼 hover: Blue-600 to Blue-700

### 5-4. Shadow & Border Radius
- [x] Shadow-sm: 기본 카드
- [x] Shadow-md: Hover/Active
- [x] Shadow-lg: Modal/Dialog (기본 shadcn/ui 적용)
- [x] Border-radius: 8px (기본, --radius: 0.5rem)
- [x] Border-radius: 12px (큰 카드, rounded-xl)

---

## Phase 6: 반응형 & 접근성

### 6-1. Light Mode 최적화
- [x] 밝은 배경에서 텍스트 대비 확인 (WCAG AA 이상) - Primary Blue, Green-600, Red-600 모두 AA 준수
- [x] Blue/Green 컬러 대비 확인 - 모든 주요 컬러 대비 검증 완료
- [x] Focus indicator 명확하게 표시 - Blue-500 ring (CSS Variables --ring)

### 6-2. Dark Mode (선택)
- [ ] Dark Mode 토글 UI 추가 여부 결정
- [ ] Dark 배경: Gray-900
- [ ] Dark 텍스트: Gray-100
- [ ] Dark Primary: Blue-400 (밝게 조정)
- [ ] Dark Secondary: Green-400

### 6-3. 컬러 블라인드 대응
- [ ] Red/Green 구분이 필요한 곳에 아이콘 추가
- [ ] Income/Expense에 화살표 추가 검토

---

## Phase 7: 스타일 가이드 문서화

### 7-1. 컬러 팔레트 문서
- [ ] prompts/design-system.md 작성
- [ ] 각 컬러별 사용 예시 명시
- [ ] Figma/Sketch 파일 생성 (선택)

### 7-2. 컴포넌트 스타일 가이드
- [ ] 각 컴포넌트별 variant 문서화
- [ ] Storybook 구성 검토 (선택)

---

## Phase 8: 테스트 & 검증

### 8-1. 시각적 테스트
- [ ] 모든 페이지 스크린샷 비교 (Before/After)
- [x] 모바일/태블릿/데스크톱 반응형 확인 - 모든 컴포넌트 sm:, lg: 브레이크포인트 적용 완료
- [ ] 다양한 브라우저 테스트 (Chrome, Safari, Firefox)

### 8-2. 접근성 테스트
- [ ] Lighthouse Accessibility 점수 90+ 확인
- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 테스트

### 8-3. 사용자 피드백
- [ ] 베타 테스터 피드백 수집
- [ ] 컬러 선호도 조사
- [ ] UI 개선 사항 반영

---

## 참고 사항

### 추천 컬러 값 (Tailwind 기준)
- **Primary Blue**: `blue-500` (#3B82F6)
- **Secondary Green**: `green-500` (#10B981) 또는 `emerald-500` (#10B981)
- **Background**: `white` (#FFFFFF)
- **Text**: `gray-900` (#111827)
- **Border**: `gray-200` (#E5E7EB)

### 디자인 영감
- Stripe Dashboard (밝고 깔끔한 디자인)
- Linear (모던하고 미니멀)
- Notion (화이트 베이스 + 서브틀 컬러)
- Vercel Dashboard (블루 포인트)

### 구현 우선순위
1. **High Priority**: Tailwind Config, CSS Variables, Button, Card
2. **Medium Priority**: Badge, Input, ProgressCard, PeriodChips
3. **Low Priority**: Dark Mode, 그라데이션, 애니메이션
