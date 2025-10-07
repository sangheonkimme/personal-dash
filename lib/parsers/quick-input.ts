import { TransactionType } from '@/app/generated/prisma';
import type { ParsedInput } from '@/types';
import { parseDate, parseNumber } from '@/lib/utils/format';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Quick Add Bar 입력 파싱 함수
 *
 * @description
 * 사용자의 자연어 입력을 파싱하여 거래 내역 데이터로 변환합니다.
 * 해시태그를 우선적으로 파싱하고, 날짜/금액/카테고리/설명을 추출합니다.
 *
 * @param raw - 원본 입력 문자열
 * @param locale - 로케일 (ko 또는 en)
 * @param fallbackType - 해시태그가 없을 때 사용할 기본 타입 (토글 값)
 * @param fallbackFixed - 해시태그가 없을 때 사용할 기본 고정 여부 (토글 값)
 *
 * @returns ParsedInput 객체
 *
 * @example
 * // 한국어 입력
 * parseQuickInput('10/05 점심 9,000원 #변동 #식비 카드', 'ko')
 * // {
 * //   date: '2025-10-05T00:00:00+09:00',
 * //   amount: 9000,
 * //   type: 'expense',
 * //   fixed: false,
 * //   category: '식비',
 * //   description: '점심',
 * //   tags: ['변동', '식비'],
 * //   paymentMethod: '카드'
 * // }
 *
 * @example
 * // 영어 입력
 * parseQuickInput('10/05 salary $3000 #income #fixed', 'en')
 * // {
 * //   date: '2025-10-05T00:00:00+09:00',
 * //   amount: 3000,
 * //   type: 'income',
 * //   fixed: true,
 * //   category: null,
 * //   description: 'salary',
 * //   tags: ['income', 'fixed'],
 * //   paymentMethod: null
 * // }
 */
export function parseQuickInput(
  raw: string,
  locale: 'ko' | 'en' = 'ko',
  fallbackType?: TransactionType,
  fallbackFixed?: boolean
): ParsedInput {
  let input = raw.trim();

  // 1. 해시태그 추출 및 제거
  const hashtagRegex = /#[\w가-힣]+/g;
  const hashtags = input.match(hashtagRegex) || [];
  const tags = hashtags.map((tag) => tag.slice(1)); // # 제거

  // 해시태그 제거 (파싱 후)
  input = input.replace(hashtagRegex, '').trim();

  // 2. 타입 & 고정 여부 파싱 (해시태그 우선)
  const { type, fixed } = parseTypeAndFixed(tags, locale, fallbackType, fallbackFixed);

  // 3. 날짜 파싱
  const { date, remaining: afterDate } = parseDateFromInput(input, locale);

  // 4. 금액 파싱
  const { amount, remaining: afterAmount } = parseAmountFromInput(afterDate, locale);

  // 5. 결제수단 파싱
  const { paymentMethod, remaining: afterPayment } = parsePaymentMethodFromInput(afterAmount, locale);

  // 6. 카테고리 파싱 (해시태그 또는 키워드)
  const { category, subcategory, remaining: afterCategory } = parseCategoryFromInput(
    afterPayment,
    tags,
    locale
  );

  // 7. 나머지는 설명으로 처리
  const description = afterCategory.trim() || '';

  return {
    date,
    amount,
    type,
    fixed,
    category,
    subcategory,
    description,
    tags,
    paymentMethod,
  };
}

/**
 * 타입과 고정 여부 파싱
 */
function parseTypeAndFixed(
  tags: string[],
  locale: 'ko' | 'en',
  fallbackType?: TransactionType,
  fallbackFixed?: boolean
): { type: TransactionType | null; fixed: boolean | null } {
  let type: TransactionType | null = fallbackType ?? null;
  let fixed: boolean | null = fallbackFixed ?? null;

  const typeKeywords = {
    ko: {
      income: ['수입', '입금', '월급', 'income'],
      expense: ['지출', '출금', '결제', 'expense'],
      fixed: ['고정', 'fixed'],
      variable: ['변동', 'variable'],
    },
    en: {
      income: ['income', 'revenue', 'salary'],
      expense: ['expense', 'payment', 'spending'],
      fixed: ['fixed', 'recurring'],
      variable: ['variable', 'oneoff', 'one-off'],
    },
  };

  const keywords = typeKeywords[locale];

  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();

    // 타입 체크
    if (keywords.income.some((k) => lowerTag.includes(k))) {
      type = TransactionType.income;
    } else if (keywords.expense.some((k) => lowerTag.includes(k))) {
      type = TransactionType.expense;
    }

    // 고정 여부 체크
    if (keywords.fixed.some((k) => lowerTag.includes(k))) {
      fixed = true;
    } else if (keywords.variable.some((k) => lowerTag.includes(k))) {
      fixed = false;
    }
  }

  // 고정/변동이 있는데 타입이 없으면 기본값은 expense
  if (fixed !== null && type === null) {
    type = TransactionType.expense;
  }

  return { type, fixed };
}

/**
 * 날짜 파싱
 */
function parseDateFromInput(input: string, locale: 'ko' | 'en'): { date: string | null; remaining: string } {
  // MM/DD 포맷 파싱
  const mmddRegex = /\b(\d{1,2})\/(\d{1,2})\b/;
  const mmddMatch = input.match(mmddRegex);

  if (mmddMatch) {
    const [fullMatch, month, day] = mmddMatch;
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    // 유효한 날짜인지 검증
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      try {
        const dateStr = parseDate(`${month}/${day}`);
        return {
          date: dateStr,
          remaining: input.replace(fullMatch, '').trim(),
        };
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }

  // YYYY-MM-DD 포맷 파싱
  const yyyymmddRegex = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/;
  const yyyymmddMatch = input.match(yyyymmddRegex);

  if (yyyymmddMatch) {
    const [fullMatch] = yyyymmddMatch;
    try {
      const dateStr = parseDate(fullMatch);
      return {
        date: dateStr,
        remaining: input.replace(fullMatch, '').trim(),
      };
    } catch {
      // 파싱 실패 시 무시
    }
  }

  // 상대 날짜 파싱 (한국어)
  if (locale === 'ko') {
    const relativeRegex = /(오늘|어제|내일|모레)/;
    const relativeMatch = input.match(relativeRegex);

    if (relativeMatch) {
      const [fullMatch, keyword] = relativeMatch;
      let date: string | null = null;

      switch (keyword) {
        case '오늘':
          date = dayjs().tz('Asia/Seoul').startOf('day').toISOString();
          break;
        case '어제':
          date = dayjs().tz('Asia/Seoul').subtract(1, 'day').startOf('day').toISOString();
          break;
        case '내일':
          date = dayjs().tz('Asia/Seoul').add(1, 'day').startOf('day').toISOString();
          break;
        case '모레':
          date = dayjs().tz('Asia/Seoul').add(2, 'day').startOf('day').toISOString();
          break;
      }

      return {
        date,
        remaining: input.replace(fullMatch, '').trim(),
      };
    }
  }

  // 상대 날짜 파싱 (영어)
  if (locale === 'en') {
    const relativeRegex = /\b(today|yesterday|tomorrow)\b/i;
    const relativeMatch = input.match(relativeRegex);

    if (relativeMatch) {
      const [fullMatch, keyword] = relativeMatch;
      let date: string | null = null;

      switch (keyword.toLowerCase()) {
        case 'today':
          date = dayjs().tz('Asia/Seoul').startOf('day').toISOString();
          break;
        case 'yesterday':
          date = dayjs().tz('Asia/Seoul').subtract(1, 'day').startOf('day').toISOString();
          break;
        case 'tomorrow':
          date = dayjs().tz('Asia/Seoul').add(1, 'day').startOf('day').toISOString();
          break;
      }

      return {
        date,
        remaining: input.replace(fullMatch, '').trim(),
      };
    }
  }

  // 날짜 없음
  return { date: null, remaining: input };
}

/**
 * 금액 파싱
 */
function parseAmountFromInput(input: string, locale: 'ko' | 'en'): { amount: number | null; remaining: string } {
  // 한국어: 10,000원, 1만원, 5천원
  if (locale === 'ko') {
    // 만원/천원 단위 파싱
    const unitRegex = /([\d,]+)\s*(만|천)\s*원/;
    const unitMatch = input.match(unitRegex);

    if (unitMatch) {
      const [fullMatch, numStr, unit] = unitMatch;
      // 음수 체크
      const beforeMatch = input.substring(0, input.indexOf(fullMatch));
      if (beforeMatch.endsWith('-')) {
        // 음수는 건너뜀
      } else {
        try {
          const baseAmount = parseNumber(numStr, locale);
          const amount = unit === '만' ? baseAmount * 10000 : baseAmount * 1000;
          return {
            amount,
            remaining: input.replace(fullMatch, '').trim(),
          };
        } catch {
          // 파싱 실패 시 무시
        }
      }
    }

    // 일반 금액 파싱 (10,000원, 5000원)
    const amountRegex = /([\d,]+)\s*원/;
    const amountMatch = input.match(amountRegex);

    if (amountMatch) {
      const [fullMatch, numStr] = amountMatch;
      // 음수 체크
      const beforeMatch = input.substring(0, input.indexOf(fullMatch));
      if (beforeMatch.endsWith('-')) {
        // 음수는 건너뜀
        return { amount: null, remaining: input };
      }

      try {
        const amount = parseNumber(numStr, locale);
        return {
          amount,
          remaining: input.replace(fullMatch, '').trim(),
        };
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }

  // 영어: $1,000, 1000, USD 1000
  if (locale === 'en') {
    // $1,000 또는 USD 1000 파싱
    const amountRegex = /(?:\$|USD|usd)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:USD|usd)?\b/;
    const amountMatch = input.match(amountRegex);

    if (amountMatch) {
      const [fullMatch, numStr] = amountMatch;
      try {
        const amount = parseNumber(numStr, locale);
        return {
          amount,
          remaining: input.replace(fullMatch, '').trim(),
        };
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }

  // 금액 없음
  return { amount: null, remaining: input };
}

/**
 * 결제수단 파싱
 */
function parsePaymentMethodFromInput(
  input: string,
  locale: 'ko' | 'en'
): { paymentMethod: string | null; remaining: string } {
  const paymentKeywords = {
    ko: {
      card: ['카드', '체크', '신용', 'card'],
      cash: ['현금', 'cash'],
      transfer: ['이체', '계좌', 'transfer'],
    },
    en: {
      card: ['card', 'credit', 'debit'],
      cash: ['cash'],
      transfer: ['transfer', 'bank'],
    },
  };

  const keywords = paymentKeywords[locale];

  for (const [method, terms] of Object.entries(keywords)) {
    for (const term of terms) {
      // 한글은 \b가 작동하지 않으므로 조건부 처리
      const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(term);
      const regex = isKorean
        ? new RegExp(term, 'i')
        : new RegExp(`\\b${term}\\b`, 'i');

      if (regex.test(input)) {
        return {
          paymentMethod: method,
          remaining: input.replace(regex, '').trim(),
        };
      }
    }
  }

  return { paymentMethod: null, remaining: input };
}

/**
 * 카테고리 파싱
 */
function parseCategoryFromInput(
  input: string,
  tags: string[],
  locale: 'ko' | 'en'
): { category: string | null; subcategory: string | null; remaining: string } {
  // 카테고리 키워드 (lib/constants/categories.ts와 동기화 필요)
  const categoryKeywords = {
    ko: ['식비', '교통', '주거', '통신', '의료', '문화', '쇼핑', '기타'],
    en: ['food', 'transport', 'housing', 'telecom', 'medical', 'culture', 'shopping', 'other'],
  };

  const keywords = categoryKeywords[locale];

  // 1. 해시태그에서 카테고리 찾기
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    for (const keyword of keywords) {
      if (lowerTag.includes(keyword.toLowerCase())) {
        return {
          category: keyword,
          subcategory: null,
          remaining: input,
        };
      }
    }
  }

  // 2. 입력 문자열에서 카테고리 키워드 찾기 (주석 처리 - 해시태그에서만 파싱)
  // for (const keyword of keywords) {
  //   const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(keyword);
  //   const regex = isKorean
  //     ? new RegExp(keyword, 'i')
  //     : new RegExp(`\\b${keyword}\\b`, 'i');

  //   if (regex.test(input)) {
  //     return {
  //       category: keyword,
  //       subcategory: null,
  //       remaining: input.replace(regex, '').trim(),
  //     };
  //   }
  // }

  // 카테고리 없음
  return { category: null, subcategory: null, remaining: input };
}
