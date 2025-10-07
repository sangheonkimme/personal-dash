import type { Category } from '@/types';

/**
 * 카테고리 목록 (다국어 지원)
 * 메시지 파일의 category 키와 매핑됨
 */
export const CATEGORIES: Category[] = [
  // 수입 카테고리
  {
    id: 'salary',
    name: 'category.salary',
    subcategories: ['bonus'],
  },
  {
    id: 'investment',
    name: 'category.investment',
  },

  // 지출 카테고리
  {
    id: 'housing',
    name: 'category.housing',
    subcategories: ['rent', 'utilities'],
  },
  {
    id: 'food',
    name: 'category.food',
  },
  {
    id: 'transportation',
    name: 'category.transportation',
  },
  {
    id: 'communication',
    name: 'category.communication',
    subcategories: ['mobile', 'internet'],
  },
  {
    id: 'culture',
    name: 'category.culture',
    subcategories: ['movie', 'ott'],
  },
  {
    id: 'health',
    name: 'category.health',
  },
  {
    id: 'education',
    name: 'category.education',
  },
  {
    id: 'shopping',
    name: 'category.shopping',
  },
  {
    id: 'etc',
    name: 'category.etc',
  },
];

/**
 * 카테고리 ID로 카테고리 찾기
 */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

/**
 * 수입 카테고리 목록
 */
export const INCOME_CATEGORIES = ['salary', 'investment'];

/**
 * 지출 카테고리 목록
 */
export const EXPENSE_CATEGORIES = CATEGORIES.filter((cat) => !INCOME_CATEGORIES.includes(cat.id)).map(
  (cat) => cat.id
);
