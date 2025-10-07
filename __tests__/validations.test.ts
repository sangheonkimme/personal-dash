/**
 * @jest-environment node
 */

import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
  transactionIdSchema,
} from '@/lib/validations/transaction';
import { updateUserSettingsSchema, onboardingSettingsSchema } from '@/lib/validations/user';
import { TransactionType } from '@/app/generated/prisma';

describe('Transaction Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    test('유효한 transaction 생성 데이터', () => {
      const validData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense' as TransactionType,
        fixed: false,
        category: '식비',
        description: '점심',
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expect.objectContaining(validData));
        expect(result.data.tags).toEqual([]); // 기본값
      }
    });

    test('모든 필드 포함한 유효한 데이터', () => {
      const validData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'income' as TransactionType,
        fixed: true,
        category: '수입',
        subcategory: '월급',
        description: '10월 급여',
        amount: 5000000,
        paymentMethod: '이체',
        recurrence: 'FREQ=MONTHLY;COUNT=12',
        tags: ['월급', '정기수입'],
      };

      const result = createTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('필수 필드 누락 - date', () => {
      const invalidData = {
        type: 'expense',
        fixed: false,
        category: '식비',
        description: '점심',
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('필수 필드 누락 - category', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense',
        fixed: false,
        description: '점심',
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('잘못된 날짜 포맷', () => {
      const invalidData = {
        date: '2025-10-15', // ISO 8601 datetime이 아닌 날짜만
        type: 'expense',
        fixed: false,
        category: '식비',
        description: '점심',
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('잘못된 type 값', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'invalid_type',
        fixed: false,
        category: '식비',
        description: '점심',
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('음수 amount', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense',
        fixed: false,
        category: '식비',
        description: '점심',
        amount: -10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('0 amount', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense',
        fixed: false,
        category: '식비',
        description: '점심',
        amount: 0,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('category 길이 초과 (51자)', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense',
        fixed: false,
        category: 'a'.repeat(51),
        description: '점심',
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('description 길이 초과 (201자)', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense',
        fixed: false,
        category: '식비',
        description: 'a'.repeat(201),
        amount: 10000,
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('tag 길이 초과 (31자)', () => {
      const invalidData = {
        date: '2025-10-15T00:00:00.000Z',
        type: 'expense',
        fixed: false,
        category: '식비',
        description: '점심',
        amount: 10000,
        tags: ['a'.repeat(31)],
      };

      const result = createTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateTransactionSchema', () => {
    test('부분 업데이트 - amount만', () => {
      const validData = {
        amount: 15000,
      };

      const result = updateTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('부분 업데이트 - 여러 필드', () => {
      const validData = {
        category: '교통',
        amount: 5000,
        paymentMethod: '카드',
      };

      const result = updateTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('빈 객체 (모든 필드 optional)', () => {
      const validData = {};

      const result = updateTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('잘못된 amount (음수)', () => {
      const invalidData = {
        amount: -5000,
      };

      const result = updateTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getTransactionsQuerySchema', () => {
    test('기본값 적용 (빈 객체)', () => {
      const result = getTransactionsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    test('페이지네이션 파라미터', () => {
      const validData = {
        page: '3',
        pageSize: '50',
      };

      const result = getTransactionsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(50);
      }
    });

    test('날짜 범위 필터', () => {
      const validData = {
        startDate: '2025-10-01T00:00:00.000Z',
        endDate: '2025-10-31T23:59:59.999Z',
      };

      const result = getTransactionsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('카테고리 및 타입 필터', () => {
      const validData = {
        category: '식비',
        type: 'expense',
      };

      const result = getTransactionsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('fixed 필터 (문자열 → boolean 변환)', () => {
      const result1 = getTransactionsQuerySchema.safeParse({ fixed: 'true' });
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data.fixed).toBe(true);
      }

      const result2 = getTransactionsQuerySchema.safeParse({ fixed: 'false' });
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data.fixed).toBe(false);
      }
    });

    test('정렬 파라미터', () => {
      const validData = {
        sort: 'date:desc',
      };

      const result = getTransactionsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('잘못된 정렬 포맷', () => {
      const invalidData = {
        sort: 'invalid_format',
      };

      const result = getTransactionsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('pageSize 최대값 초과 (101)', () => {
      const invalidData = {
        pageSize: '101',
      };

      const result = getTransactionsQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('검색어', () => {
      const validData = {
        q: '점심',
      };

      const result = getTransactionsQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('transactionIdSchema', () => {
    test('유효한 숫자 ID (문자열)', () => {
      const result = transactionIdSchema.safeParse({ id: '123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123);
      }
    });

    test('잘못된 ID (음수)', () => {
      const result = transactionIdSchema.safeParse({ id: '-1' });
      expect(result.success).toBe(false);
    });

    test('잘못된 ID (0)', () => {
      const result = transactionIdSchema.safeParse({ id: '0' });
      expect(result.success).toBe(false);
    });

    test('잘못된 ID (문자열)', () => {
      const result = transactionIdSchema.safeParse({ id: 'abc' });
      expect(result.success).toBe(false);
    });
  });
});

describe('User Settings Validation Schemas', () => {
  describe('onboardingSettingsSchema', () => {
    test('유효한 설정 데이터', () => {
      const validData = {
        salaryDay: 25,
        currency: 'KRW',
        locale: 'ko-KR',
      };

      const result = onboardingSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('기본값 적용 (빈 객체)', () => {
      const result = onboardingSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salaryDay).toBe(25);
        expect(result.data.currency).toBe('KRW');
        expect(result.data.locale).toBe('ko-KR');
      }
    });

    test('salaryDay 범위 체크 (1~31)', () => {
      const valid1 = onboardingSettingsSchema.safeParse({ salaryDay: 1 });
      expect(valid1.success).toBe(true);

      const valid31 = onboardingSettingsSchema.safeParse({ salaryDay: 31 });
      expect(valid31.success).toBe(true);

      const invalid0 = onboardingSettingsSchema.safeParse({ salaryDay: 0 });
      expect(invalid0.success).toBe(false);

      const invalid32 = onboardingSettingsSchema.safeParse({ salaryDay: 32 });
      expect(invalid32.success).toBe(false);
    });

    test('통화 코드 포맷 (3글자 대문자)', () => {
      const validCurrencies = ['KRW', 'USD', 'EUR', 'JPY'];

      validCurrencies.forEach((currency) => {
        const result = onboardingSettingsSchema.safeParse({ currency });
        expect(result.success).toBe(true);
      });
    });

    test('잘못된 통화 코드', () => {
      // 소문자
      const invalid1 = onboardingSettingsSchema.safeParse({ currency: 'krw' });
      expect(invalid1.success).toBe(false);

      // 4글자
      const invalid2 = onboardingSettingsSchema.safeParse({ currency: 'KRWW' });
      expect(invalid2.success).toBe(false);

      // 2글자
      const invalid3 = onboardingSettingsSchema.safeParse({ currency: 'KR' });
      expect(invalid3.success).toBe(false);
    });

    test('로케일 포맷 (BCP 47: ko-KR, en-US)', () => {
      const validLocales = ['ko-KR', 'en-US', 'ja-JP', 'zh-CN'];

      validLocales.forEach((locale) => {
        const result = onboardingSettingsSchema.safeParse({ locale });
        expect(result.success).toBe(true);
      });
    });

    test('잘못된 로케일 포맷', () => {
      // 대소문자 잘못됨
      const invalid1 = onboardingSettingsSchema.safeParse({ locale: 'KO-kr' });
      expect(invalid1.success).toBe(false);

      // 2글자만
      const invalid2 = onboardingSettingsSchema.safeParse({ locale: 'ko' });
      expect(invalid2.success).toBe(false);

      // 구분자 없음
      const invalid3 = onboardingSettingsSchema.safeParse({ locale: 'kokr' });
      expect(invalid3.success).toBe(false);
    });
  });

  describe('updateUserSettingsSchema', () => {
    test('부분 업데이트 - salaryDay만', () => {
      const result = updateUserSettingsSchema.safeParse({ salaryDay: 15 });
      expect(result.success).toBe(true);
    });

    test('부분 업데이트 - 여러 필드', () => {
      const result = updateUserSettingsSchema.safeParse({
        salaryDay: 15,
        currency: 'USD',
      });
      expect(result.success).toBe(true);
    });

    test('빈 객체', () => {
      const result = updateUserSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
