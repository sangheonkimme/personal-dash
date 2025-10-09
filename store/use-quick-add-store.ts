import { create } from 'zustand';
import { TransactionType } from '@/app/generated/prisma';

/**
 * Quick Add Bar 입력 상태
 */
interface QuickAddState {
  /**
   * 원본 입력 문자열
   */
  rawInput: string;

  /**
   * 해시태그 없는 경우 기본 거래 타입
   */
  fallbackType: TransactionType;

  /**
   * 해시태그 없는 경우 기본 고정 여부
   */
  fallbackFixed: boolean;

  /**
   * 입력 문자열 변경
   */
  setRawInput: (input: string) => void;

  /**
   * 타입 기본값 설정
   */
  setFallbackType: (type: TransactionType) => void;

  /**
   * 고정 여부 기본값 설정
   */
  setFallbackFixed: (fixed: boolean) => void;

  /**
   * 입력 초기화
   */
  reset: () => void;
}

/**
 * Quick Add Bar 입력 스토어
 *
 * @description
 * Quick Add Bar의 입력 상태를 관리합니다.
 * 입력 문자열과 토글 상태를 저장합니다.
 */
export const useQuickAddStore = create<QuickAddState>((set) => ({
  rawInput: '',
  fallbackType: TransactionType.expense, // 기본값: 지출
  fallbackFixed: false, // 기본값: 변동

  setRawInput: (input) => set({ rawInput: input }),

  setFallbackType: (type) => set({ fallbackType: type }),

  setFallbackFixed: (fixed) => set({ fallbackFixed: fixed }),

  reset: () => set({ rawInput: '' }),
}));
