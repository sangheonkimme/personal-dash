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
   * 입력 타입 토글 (해시태그가 없을 때 사용)
   */
  fallbackType: TransactionType;

  /**
   * 고정 지출 토글 (해시태그가 없을 때 사용)
   */
  fallbackFixed: boolean;

  /**
   * 입력 문자열 변경
   */
  setRawInput: (input: string) => void;

  /**
   * 타입 설정
   */
  toggleType: (type: TransactionType) => void;

  /**
   * 고정 여부 설정
   */
  toggleFixed: (fixed: boolean) => void;

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

  toggleType: (type) => set({ fallbackType: type }),

  toggleFixed: (fixed) => set({ fallbackFixed: fixed }),

  reset: () =>
    set({
      rawInput: '',
      fallbackType: TransactionType.expense,
      fallbackFixed: false,
    }),
}));
