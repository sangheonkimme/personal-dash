import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 언어 설정 상태
 */
interface LocaleState {
  /**
   * 현재 로케일
   */
  locale: 'ko' | 'en';

  /**
   * 로케일 변경
   */
  setLocale: (locale: 'ko' | 'en') => void;

  /**
   * 로케일 토글
   */
  toggleLocale: () => void;
}

/**
 * 로케일 스토어
 *
 * @description
 * 사용자의 언어 설정을 관리합니다.
 * next-intl과 연동하여 사용됩니다.
 */
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'ko', // 기본값: 한국어

      setLocale: (locale) => set({ locale }),

      toggleLocale: () =>
        set((state) => ({
          locale: state.locale === 'ko' ? 'en' : 'ko',
        })),
    }),
    {
      name: 'locale-storage', // localStorage 키
    }
  )
);
