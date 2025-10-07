import { parseQuickInput } from '@/lib/parsers/quick-input';
import { TransactionType } from '@/app/generated/prisma';
import dayjs from 'dayjs';

describe('parseQuickInput', () => {
  describe('한국어 입력 파싱', () => {
    test('완전한 입력 - 날짜, 금액, 카테고리, 해시태그', () => {
      const result = parseQuickInput('10/05 점심 9,000원 #변동 #식비 카드', 'ko');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('MM/DD')).toBe('10/05');
      expect(result.amount).toBe(9000);
      expect(result.type).toBe(TransactionType.expense);
      expect(result.fixed).toBe(false);
      expect(result.category).toBe('식비');
      expect(result.description).toBe('점심');
      expect(result.tags).toEqual(['변동', '식비']);
      expect(result.paymentMethod).toBe('card');
    });

    test('금액 - 만원 단위', () => {
      const result = parseQuickInput('월급 300만원 #수입 #고정', 'ko');

      expect(result.amount).toBe(3000000);
      expect(result.type).toBe(TransactionType.income);
      expect(result.fixed).toBe(true);
      expect(result.description).toBe('월급');
    });

    test('금액 - 천원 단위', () => {
      const result = parseQuickInput('커피 5천원', 'ko');

      expect(result.amount).toBe(5000);
      expect(result.description).toBe('커피');
    });

    test('상대 날짜 - 오늘', () => {
      const result = parseQuickInput('오늘 저녁 15000원 #식비', 'ko');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('YYYY-MM-DD')).toBe(dayjs().format('YYYY-MM-DD'));
      expect(result.amount).toBe(15000);
      expect(result.description).toBe('저녁');
    });

    test('상대 날짜 - 어제', () => {
      const result = parseQuickInput('어제 택시 12000원 #교통', 'ko');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('YYYY-MM-DD')).toBe(
        dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      );
      expect(result.amount).toBe(12000);
    });

    test('결제수단 - 카드', () => {
      const result = parseQuickInput('저녁 30000원 카드 #식비', 'ko');

      expect(result.paymentMethod).toBe('card');
      expect(result.amount).toBe(30000);
    });

    test('결제수단 - 현금', () => {
      const result = parseQuickInput('버스비 1500원 현금', 'ko');

      expect(result.paymentMethod).toBe('cash');
      expect(result.amount).toBe(1500);
    });

    test('부분 입력 - 금액만', () => {
      const result = parseQuickInput('15000원', 'ko');

      expect(result.amount).toBe(15000);
      expect(result.date).toBeNull();
      expect(result.category).toBeNull();
      expect(result.description).toBe('');
    });

    test('부분 입력 - 설명만', () => {
      const result = parseQuickInput('점심 식사', 'ko');

      expect(result.amount).toBeNull();
      expect(result.description).toBe('점심 식사');
    });

    test('수입 거래', () => {
      const result = parseQuickInput('10/01 월급 3500000원 #수입 #고정', 'ko');

      expect(result.type).toBe(TransactionType.income);
      expect(result.fixed).toBe(true);
      expect(result.amount).toBe(3500000);
    });

    test('고정 지출', () => {
      const result = parseQuickInput('통신비 50000원 #고정 #통신', 'ko');

      expect(result.fixed).toBe(true);
      expect(result.category).toBe('통신');
      expect(result.amount).toBe(50000);
    });

    test('fallback 타입 사용 (해시태그 없음)', () => {
      const result = parseQuickInput('커피 5000원', 'ko', TransactionType.expense, false);

      expect(result.type).toBe(TransactionType.expense);
      expect(result.fixed).toBe(false);
    });

    test('YYYY-MM-DD 날짜 포맷', () => {
      const result = parseQuickInput('2025-10-15 점심 10000원', 'ko');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('YYYY-MM-DD')).toBe('2025-10-15');
    });
  });

  describe('영어 입력 파싱', () => {
    test('완전한 입력 - 날짜, 금액, 카테고리, 해시태그', () => {
      const result = parseQuickInput('10/05 lunch $15 #variable #food card', 'en');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('MM/DD')).toBe('10/05');
      expect(result.amount).toBe(15);
      expect(result.type).toBe(TransactionType.expense);
      expect(result.fixed).toBe(false);
      expect(result.category).toBe('food');
      expect(result.description).toBe('lunch');
      expect(result.paymentMethod).toBe('card');
    });

    test('금액 - 달러 기호', () => {
      const result = parseQuickInput('coffee $5.50', 'en');

      expect(result.amount).toBe(5.5);
      expect(result.description).toBe('coffee');
    });

    test('금액 - USD 표기', () => {
      const result = parseQuickInput('salary 3000 USD #income #fixed', 'en');

      expect(result.amount).toBe(3000);
      expect(result.type).toBe(TransactionType.income);
      expect(result.fixed).toBe(true);
    });

    test('상대 날짜 - today', () => {
      const result = parseQuickInput('today dinner $25 #food', 'en');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('YYYY-MM-DD')).toBe(dayjs().format('YYYY-MM-DD'));
      expect(result.amount).toBe(25);
    });

    test('상대 날짜 - yesterday', () => {
      const result = parseQuickInput('yesterday taxi $12 #transport', 'en');

      expect(result.date).toBeTruthy();
      expect(dayjs(result.date).format('YYYY-MM-DD')).toBe(
        dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      );
    });

    test('결제수단 - credit card', () => {
      const result = parseQuickInput('dinner $30 credit', 'en');

      expect(result.paymentMethod).toBe('card');
      expect(result.amount).toBe(30);
    });

    test('결제수단 - cash', () => {
      const result = parseQuickInput('bus $1.50 cash', 'en');

      expect(result.paymentMethod).toBe('cash');
      expect(result.amount).toBe(1.5);
    });

    test('수입 거래', () => {
      const result = parseQuickInput('10/01 salary $3500 #income #fixed', 'en');

      expect(result.type).toBe(TransactionType.income);
      expect(result.fixed).toBe(true);
      expect(result.amount).toBe(3500);
    });
  });

  describe('해시태그 우선순위', () => {
    test('해시태그가 fallback보다 우선', () => {
      const result = parseQuickInput(
        '점심 10000원 #수입',
        'ko',
        TransactionType.expense, // fallback
        false
      );

      // 해시태그의 #수입이 fallback의 expense보다 우선
      expect(result.type).toBe(TransactionType.income);
    });

    test('해시태그 없으면 fallback 사용', () => {
      const result = parseQuickInput(
        '점심 10000원',
        'ko',
        TransactionType.expense,
        true
      );

      expect(result.type).toBe(TransactionType.expense);
      expect(result.fixed).toBe(true);
    });
  });

  describe('엣지 케이스', () => {
    test('빈 문자열', () => {
      const result = parseQuickInput('', 'ko');

      expect(result.date).toBeNull();
      expect(result.amount).toBeNull();
      expect(result.type).toBeNull();
      expect(result.fixed).toBeNull();
      expect(result.category).toBeNull();
      expect(result.description).toBe('');
      expect(result.tags).toEqual([]);
      expect(result.paymentMethod).toBeNull();
    });

    test('공백만 있는 문자열', () => {
      const result = parseQuickInput('   ', 'ko');

      expect(result.description).toBe('');
      expect(result.tags).toEqual([]);
    });

    test('해시태그만', () => {
      const result = parseQuickInput('#고정 #식비', 'ko');

      expect(result.fixed).toBe(true);
      expect(result.category).toBe('식비');
      expect(result.tags).toEqual(['고정', '식비']);
      expect(result.description).toBe('');
    });

    test('여러 해시태그 중복', () => {
      const result = parseQuickInput('점심 #식비 #고정 #변동', 'ko');

      // 마지막 것이 우선 (변동이 고정보다 나중)
      expect(result.fixed).toBe(false);
      expect(result.tags).toContain('고정');
      expect(result.tags).toContain('변동');
    });

    test('잘못된 날짜 형식 무시', () => {
      const result = parseQuickInput('99/99 점심 10000원', 'ko');

      // 잘못된 날짜는 무시되고 설명으로 처리
      expect(result.date).toBeNull();
      expect(result.description).toContain('99/99');
    });

    test('음수 금액 무시', () => {
      const result = parseQuickInput('환불 -10000원', 'ko');

      // 음수는 파싱되지 않음
      expect(result.amount).toBeNull();
      expect(result.description).toContain('환불');
    });
  });
});
