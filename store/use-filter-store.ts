import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TransactionType } from '@/app/generated/prisma';

/**
 * 필터/정렬 UI 상태
 */
interface FilterState {
  /**
   * 거래 타입 필터
   */
  typeFilter: TransactionType | 'all';

  /**
   * 고정 지출 필터
   */
  fixedFilter: boolean | 'all';

  /**
   * 카테고리 필터
   */
  categoryFilter: string | 'all';

  /**
   * 검색어
   */
  searchQuery: string;

  /**
   * 정렬 기준
   */
  sortBy: 'date' | 'amount' | 'category' | 'createdAt';

  /**
   * 정렬 방향
   */
  sortOrder: 'asc' | 'desc';

  /**
   * 타입 필터 변경
   */
  setTypeFilter: (type: TransactionType | 'all') => void;

  /**
   * 고정 지출 필터 변경
   */
  setFixedFilter: (fixed: boolean | 'all') => void;

  /**
   * 카테고리 필터 변경
   */
  setCategoryFilter: (category: string | 'all') => void;

  /**
   * 검색어 변경
   */
  setSearchQuery: (query: string) => void;

  /**
   * 정렬 기준 변경
   */
  setSortBy: (sortBy: FilterState['sortBy']) => void;

  /**
   * 정렬 방향 토글
   */
  toggleSortOrder: () => void;

  /**
   * 필터 초기화
   */
  resetFilters: () => void;
}

/**
 * 필터/정렬 스토어
 *
 * @description
 * 거래 내역 테이블의 필터 및 정렬 상태를 관리합니다.
 * TransactionGrid 컴포넌트와 연동됩니다.
 */
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // 초기값
      typeFilter: 'all',
      fixedFilter: 'all',
      categoryFilter: 'all',
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc',

      setTypeFilter: (type) => set({ typeFilter: type }),
      setFixedFilter: (fixed) => set({ fixedFilter: fixed }),
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sortBy) => set({ sortBy }),
      toggleSortOrder: () =>
        set((state) => ({
          sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
        })),

      resetFilters: () =>
        set({
          typeFilter: 'all',
          fixedFilter: 'all',
          categoryFilter: 'all',
          searchQuery: '',
          sortBy: 'date',
          sortOrder: 'desc',
        }),
    }),
    {
      name: 'filter-storage', // localStorage 키
    }
  )
);
