import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';

/**
 * 급여월 선택 상태
 */
interface PeriodState {
  /**
   * 현재 선택된 급여월의 기준 날짜 (ISO 8601)
   */
  anchorDate: string;

  /**
   * 급여월 변경
   */
  setAnchorDate: (date: string) => void;

  /**
   * 이전 급여월로 이동
   */
  goToPreviousPeriod: () => void;

  /**
   * 다음 급여월로 이동
   */
  goToNextPeriod: () => void;

  /**
   * 현재 급여월로 리셋
   */
  resetToToday: () => void;
}

/**
 * 급여월 선택 스토어
 *
 * @description
 * 사용자가 현재 보고 있는 급여월을 관리합니다.
 * PeriodChips 컴포넌트와 연동됩니다.
 */
export const usePeriodStore = create<PeriodState>()(
  persist(
    (set) => ({
      // 초기값: 오늘
      anchorDate: dayjs().toISOString(),

      setAnchorDate: (date) => set({ anchorDate: date }),

      goToPreviousPeriod: () =>
        set((state) => ({
          anchorDate: dayjs(state.anchorDate).subtract(1, 'month').toISOString(),
        })),

      goToNextPeriod: () =>
        set((state) => ({
          anchorDate: dayjs(state.anchorDate).add(1, 'month').toISOString(),
        })),

      resetToToday: () => set({ anchorDate: dayjs().toISOString() }),
    }),
    {
      name: 'period-storage', // localStorage 키
    }
  )
);
