import type { Transaction, TransactionType, User } from '@/app/generated/prisma';

// ========================================
// ag-Grid Row Types
// ========================================

/**
 * ag-Grid를 위한 기본 Row 인터페이스
 * 거래 내역 표시에 필요한 핵심 필드들
 */
export interface BaseRow {
  id: number;
  date: string; // ISO 8601 format
  type: TransactionType;
  fixed: boolean;
  category: string;
  subcategory: string | null;
  description: string;
  amount: number; // Decimal을 number로 변환
  paymentMethod: string | null;
  tags: string[];
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

/**
 * 제네릭 Row 타입 - 확장 가능한 구조
 * 사용 예: Row<{ notes?: string }>
 */
export type Row<TExtra extends object = object> = BaseRow & TExtra;

// ========================================
// Transaction 관련 타입
// ========================================

/**
 * Transaction을 BaseRow로 변환하는 유틸리티 타입
 */
export type TransactionToRow = (transaction: Transaction) => BaseRow;

/**
 * Transaction 생성 요청 DTO
 */
export interface CreateTransactionDTO {
  date: string; // ISO 8601 format
  type: TransactionType;
  fixed: boolean;
  category: string;
  subcategory?: string | null;
  description: string;
  amount: number;
  paymentMethod?: string | null;
  recurrence?: string | null; // RRULE string
  tags?: string[];
}

/**
 * Transaction 수정 요청 DTO
 */
export interface UpdateTransactionDTO {
  date?: string;
  type?: TransactionType;
  fixed?: boolean;
  category?: string;
  subcategory?: string | null;
  description?: string;
  amount?: number;
  paymentMethod?: string | null;
  recurrence?: string | null;
  tags?: string[];
}

/**
 * Transaction 조회 쿼리 파라미터
 */
export interface GetTransactionsQuery {
  page?: number;
  pageSize?: number;
  startDate?: string; // ISO 8601 format
  endDate?: string; // ISO 8601 format
  type?: TransactionType;
  category?: string;
  fixed?: boolean;
  q?: string; // 검색어
  sort?: string; // 정렬 (예: "date:desc", "amount:asc")
}

// ========================================
// User 설정 관련 타입
// ========================================

/**
 * User 설정 업데이트 DTO
 */
export interface UpdateUserSettingsDTO {
  salaryDay?: number; // 1~31
  currency?: string; // ISO 4217 (예: KRW, USD)
  locale?: string; // BCP 47 (예: ko-KR, en-US)
  name?: string;
}

// ========================================
// 급여월(Pay Period) 관련 타입
// ========================================

/**
 * 급여월 정보
 */
export interface PayPeriod {
  startISO: string; // ISO 8601 format
  endISO: string; // ISO 8601 format
  label: string; // 예: "2025년 10월"
}

/**
 * 급여월 쿼리 파라미터
 */
export interface GetPayPeriodQuery {
  anchorDate: string; // ISO 8601 format (기준 날짜)
}

// ========================================
// 통계/요약 관련 타입
// ========================================

/**
 * 기간별 통계 요약
 */
export interface PeriodSummary {
  income: number; // 총 수입
  expense: number; // 총 지출
  saving: number; // 저축 (income - expense)
  balance: number; // 잔액 (누적 계산 필요)
  fixedExpense: number; // 고정 지출
  variableExpense: number; // 변동 지출
}

/**
 * 통계 요약 쿼리 파라미터
 */
export interface GetSummaryQuery {
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
}

/**
 * 전월 대비 증감 정보
 */
export interface PeriodComparison {
  current: PeriodSummary;
  previous: PeriodSummary;
  changePercent: {
    income: number;
    expense: number;
    saving: number;
    balance: number;
  };
}

// ========================================
// API 공통 응답 타입
// ========================================

/**
 * 성공 응답 래퍼
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * 에러 응답 래퍼
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>; // Zod 검증 에러
  };
}

/**
 * API 응답 (성공 또는 실패)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ========================================
// Quick Add Bar 파싱 관련 타입
// ========================================

/**
 * Quick Add Bar 입력 파싱 결과
 */
export interface ParsedInput {
  date: string | null; // ISO 8601 format or null (기본값 오늘)
  amount: number | null;
  type: TransactionType | null; // null이면 토글 값 사용
  fixed: boolean | null; // null이면 토글 값 사용
  category: string | null;
  subcategory: string | null;
  description: string; // 나머지 텍스트
  tags: string[]; // 해시태그로 추출된 태그들
  paymentMethod: string | null;
}

// ========================================
// 결제 수단 Enum
// ========================================

/**
 * 결제 수단 타입
 */
export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  TRANSFER = 'transfer',
  OTHER = 'other',
}

// ========================================
// 카테고리 타입
// ========================================

/**
 * 카테고리 정보
 */
export interface Category {
  id: string;
  name: string; // 다국어 키
  subcategories?: string[]; // 하위 카테고리
}

// ========================================
// 고정 지출 템플릿 관련 타입
// ========================================

/**
 * 고정 지출 템플릿 생성 DTO
 */
export interface CreateFixedExpenseTemplateDTO {
  name: string;
  amount: number;
  category: string;
  subcategory?: string | null;
  rrule: string; // RRULE string
  startDate: string; // ISO 8601 format
  endDate?: string | null; // ISO 8601 format
  notes?: string | null;
}

/**
 * 고정 지출 템플릿 수정 DTO
 */
export interface UpdateFixedExpenseTemplateDTO {
  name?: string;
  amount?: number;
  category?: string;
  subcategory?: string | null;
  rrule?: string;
  startDate?: string;
  endDate?: string | null;
  notes?: string | null;
}
