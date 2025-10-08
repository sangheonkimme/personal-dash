# UI 디자인 리뉴얼 체크리스트

## 목표
현재 다크한 UI를 세련되고 밝은 디자인으로 변경
- **메인 컬러**: 파란색 (Blue)
- **서브 컬러**: 초록색 (Green)
- **전체 톤**: 밝고 깔끔한 화이트/라이트 베이스

---

## Phase 1: 컬러 시스템 정의

### 1-1. 메인 컬러 (Blue) 팔레트 정의
- [ ] Primary Blue 정의
  - [ ] 50 (가장 밝음) - 배경용
  - [ ] 100-200 - Hover 상태
  - [ ] 500 (메인) - 버튼, 링크
  - [ ] 600-700 - Active 상태
  - [ ] 900 (가장 어두움) - 텍스트

### 1-2. 서브 컬러 (Green) 팔레트 정의
- [ ] Accent Green 정의
  - [ ] 50-100 - Success 배경
  - [ ] 500 (메인) - Success 상태, Income 표시
  - [ ] 600-700 - Hover/Active
  - [ ] 900 - 강조 텍스트

### 1-3. 중립 컬러 (Neutral) 재정의
- [ ] White/Gray 스케일 정의
  - [ ] Background: White (#FFFFFF)
  - [ ] Secondary Background: Gray-50 (#F9FAFB)
  - [ ] Border: Gray-200 (#E5E7EB)
  - [ ] Text Primary: Gray-900 (#111827)
  - [ ] Text Secondary: Gray-600 (#4B5563)

### 1-4. 기능별 컬러 매핑
- [ ] Success: Green-500
- [ ] Error/Destructive: Red-500 (유지)
- [ ] Warning: Amber-500
- [ ] Info: Blue-500

---

## Phase 2: Tailwind Config 업데이트

### 2-1. tailwind.config.ts 수정
- [ ] Primary 컬러를 Blue로 변경
- [ ] Secondary 컬러를 Green으로 설정
- [ ] Background 컬러를 White 기반으로 변경
- [ ] Foreground 컬러를 Dark Gray로 설정
- [ ] Muted 컬러를 Light Gray로 조정
- [ ] Border 컬러를 Subtle Gray로 설정
- [ ] Ring/Focus 컬러를 Blue로 설정

### 2-2. CSS Variables 업데이트 (globals.css)
- [ ] Light 모드 CSS 변수 재정의
  - [ ] --background: White
  - [ ] --foreground: Dark Gray
  - [ ] --primary: Blue-500
  - [ ] --primary-foreground: White
  - [ ] --secondary: Green-500
  - [ ] --muted: Gray-50
  - [ ] --border: Gray-200
  - [ ] --ring: Blue-500

- [ ] Dark 모드 비활성화 또는 조정 (선택)
  - [ ] 다크 모드 사용 여부 결정
  - [ ] 사용한다면 Blue/Green 기반으로 재정의

---

## Phase 3: 공통 컴포넌트 스타일 업데이트

### 3-1. Button 컴포넌트
- [ ] Default variant: Blue 배경 + White 텍스트
- [ ] Secondary variant: Green 배경 + White 텍스트
- [ ] Outline variant: Blue 테두리 + Blue 텍스트
- [ ] Ghost variant: Hover 시 Blue-50 배경
- [ ] Destructive variant: Red 유지

### 3-2. Card 컴포넌트
- [ ] Background: White
- [ ] Border: Gray-200
- [ ] Shadow: Subtle (shadow-sm)
- [ ] Hover 효과: shadow-md로 변경

### 3-3. Badge 컴포넌트
- [ ] Default: Blue-100 배경 + Blue-700 텍스트
- [ ] Secondary: Green-100 배경 + Green-700 텍스트
- [ ] Outline: Blue 테두리
- [ ] Destructive: Red 유지

### 3-4. Input 컴포넌트
- [ ] Background: White
- [ ] Border: Gray-300
- [ ] Focus: Blue-500 ring
- [ ] Placeholder: Gray-400

### 3-5. Select 컴포넌트
- [ ] Trigger: White 배경 + Gray-300 border
- [ ] Focus: Blue-500 ring
- [ ] Content: White 배경 + shadow-md
- [ ] Item hover: Blue-50 배경

---

## Phase 4: 페이지별 컴포넌트 스타일 업데이트

### 4-1. DashboardHeader
- [ ] Background: White 고정
- [ ] Border-bottom: Gray-200
- [ ] Logo/Title: Blue-600 (메인 컬러)
- [ ] 아이콘 버튼 hover: Blue-50 배경
- [ ] Dropdown: White 배경 + shadow

### 4-2. QuickAddBar
- [ ] Card background: White
- [ ] Border: Gray-200
- [ ] 버튼 active 상태: Blue-600 배경
- [ ] 입력창 focus: Blue-500 ring
- [ ] Badge preview: Blue-100/Green-100 배경

### 4-3. ProgressCard (4종 카드)
- [ ] Income 카드
  - [ ] Border: Green-200
  - [ ] Icon/Amount: Green-600
  - [ ] Background: White

- [ ] Expense 카드
  - [ ] Border: Red-200
  - [ ] Icon/Amount: Red-600
  - [ ] Background: White

- [ ] Saving 카드
  - [ ] Border: Blue-200
  - [ ] Icon/Amount: Blue-600
  - [ ] Background: White

- [ ] Balance 카드
  - [ ] Border: Purple-200
  - [ ] Icon/Amount: Purple-600
  - [ ] Background: White

### 4-4. PeriodChips
- [ ] Default 칩: White 배경 + Blue-200 border
- [ ] Active 칩: Blue-500 배경 + White 텍스트
- [ ] Hover: Blue-50 배경
- [ ] Ring: Blue-500

### 4-5. TransactionGrid (ag-Grid)
- [ ] Theme: ag-theme-alpine (밝은 테마)
- [ ] Header background: Gray-50
- [ ] Row hover: Blue-50
- [ ] Border: Gray-200
- [ ] Selected row: Blue-100

### 4-6. OnboardingDialog
- [ ] Dialog background: White
- [ ] Overlay: Black 투명도 50%
- [ ] Title: Blue-600
- [ ] Primary button: Blue-500 배경
- [ ] Input focus: Blue-500 ring

---

## Phase 5: 특수 스타일 요소

### 5-1. Typography
- [ ] Heading 컬러: Gray-900
- [ ] Body 텍스트: Gray-700
- [ ] Muted 텍스트: Gray-500
- [ ] Link 컬러: Blue-600
- [ ] Link hover: Blue-700

### 5-2. 상태별 컬러
- [ ] Success: Green-500
- [ ] Error: Red-500
- [ ] Warning: Amber-500
- [ ] Info: Blue-500
- [ ] Neutral: Gray-400

### 5-3. 그라데이션 (선택적)
- [ ] Hero 섹션: Blue-50 to White
- [ ] Card hover: Subtle Blue-50 glow
- [ ] 버튼 hover: Blue-600 to Blue-700

### 5-4. Shadow & Border Radius
- [ ] Shadow-sm: 기본 카드
- [ ] Shadow-md: Hover/Active
- [ ] Shadow-lg: Modal/Dialog
- [ ] Border-radius: 8px (기본)
- [ ] Border-radius: 12px (큰 카드)

---

## Phase 6: 반응형 & 접근성

### 6-1. Light Mode 최적화
- [ ] 밝은 배경에서 텍스트 대비 확인 (WCAG AA 이상)
- [ ] Blue/Green 컬러 대비 확인
- [ ] Focus indicator 명확하게 표시

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
- [ ] 모바일/태블릿/데스크톱 반응형 확인
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
