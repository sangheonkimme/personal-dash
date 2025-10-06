import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ko';
import 'dayjs/locale/en';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

/**
 * 날짜 포맷팅 함수
 *
 * @param date - ISO 8601 날짜 문자열 또는 Date 객체
 * @param format - 포맷 문자열 (dayjs 포맷 또는 로케일 기반 포맷)
 * @param locale - 로케일 (ko-KR, en-US 등)
 * @param tz - 타임존 (기본값: Asia/Seoul)
 * @returns 포맷팅된 날짜 문자열
 *
 * @example
 * formatDate('2025-10-15T00:00:00Z', 'YYYY-MM-DD', 'ko-KR')
 * // Returns: '2025-10-15'
 *
 * formatDate('2025-10-15T00:00:00Z', 'll', 'ko-KR')
 * // Returns: '2025년 10월 15일'
 *
 * formatDate('2025-10-15T00:00:00Z', 'll', 'en-US')
 * // Returns: 'Oct 15, 2025'
 */
export function formatDate(
  date: string | Date,
  format: string = 'YYYY-MM-DD',
  locale: string = 'ko-KR',
  tz: string = 'Asia/Seoul'
): string {
  const dayjsLocale = locale.startsWith('ko') ? 'ko' : 'en';
  return dayjs(date).tz(tz).locale(dayjsLocale).format(format);
}

/**
 * 상대 시간 포맷팅 (예: "3일 전", "5분 전")
 *
 * @param date - ISO 8601 날짜 문자열 또는 Date 객체
 * @param locale - 로케일 (ko-KR, en-US 등)
 * @param tz - 타임존 (기본값: Asia/Seoul)
 * @returns 상대 시간 문자열
 *
 * @example
 * formatRelativeTime('2025-10-10T00:00:00Z', 'ko-KR')
 * // Returns: '5일 전' (오늘이 2025-10-15인 경우)
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'ko-KR',
  tz: string = 'Asia/Seoul'
): string {
  const dayjsLocale = locale.startsWith('ko') ? 'ko' : 'en';
  const target = dayjs(date).tz(tz);
  const now = dayjs().tz(tz);
  const diffInDays = now.diff(target, 'day');

  if (diffInDays === 0) {
    return locale.startsWith('ko') ? '오늘' : 'Today';
  } else if (diffInDays === 1) {
    return locale.startsWith('ko') ? '어제' : 'Yesterday';
  } else if (diffInDays === -1) {
    return locale.startsWith('ko') ? '내일' : 'Tomorrow';
  } else if (diffInDays > 1 && diffInDays < 7) {
    return locale.startsWith('ko') ? `${diffInDays}일 전` : `${diffInDays} days ago`;
  } else if (diffInDays < -1 && diffInDays > -7) {
    return locale.startsWith('ko') ? `${Math.abs(diffInDays)}일 후` : `in ${Math.abs(diffInDays)} days`;
  } else {
    return formatDate(date, 'll', locale, tz);
  }
}

/**
 * ISO 8601 날짜 문자열 파싱 (타임존 적용)
 *
 * @param dateString - 날짜 문자열 (다양한 포맷 지원)
 * @param tz - 타임존 (기본값: Asia/Seoul)
 * @returns ISO 8601 날짜 문자열
 *
 * @example
 * parseDate('2025-10-15')
 * // Returns: '2025-10-15T00:00:00+09:00'
 *
 * parseDate('10/15')
 * // Returns: '2025-10-15T00:00:00+09:00' (현재 연도 기준)
 */
export function parseDate(dateString: string, tz: string = 'Asia/Seoul'): string {
  // MM/DD 포맷 처리 (현재 연도 기준)
  if (/^\d{1,2}\/\d{1,2}$/.test(dateString)) {
    const [month, day] = dateString.split('/').map(Number);
    const year = dayjs().tz(tz).year();
    return dayjs()
      .tz(tz)
      .year(year)
      .month(month - 1)
      .date(day)
      .startOf('day')
      .toISOString();
  }

  // YYYY-MM-DD 또는 기타 포맷 처리
  return dayjs(dateString).tz(tz).toISOString();
}

/**
 * 통화 포맷팅 함수
 *
 * @param amount - 금액 (숫자)
 * @param currency - 통화 코드 (ISO 4217: KRW, USD 등)
 * @param locale - 로케일 (ko-KR, en-US 등)
 * @param options - Intl.NumberFormat 옵션
 * @returns 포맷팅된 통화 문자열
 *
 * @example
 * formatCurrency(1000000, 'KRW', 'ko-KR')
 * // Returns: '₩1,000,000'
 *
 * formatCurrency(1234.56, 'USD', 'en-US')
 * // Returns: '$1,234.56'
 */
export function formatCurrency(
  amount: number,
  currency: string = 'KRW',
  locale: string = 'ko-KR',
  options?: Intl.NumberFormatOptions
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2, // KRW는 소수점 없음
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
    ...options,
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(amount);
}

/**
 * 숫자 포맷팅 함수 (천 단위 구분자)
 *
 * @param value - 숫자
 * @param locale - 로케일 (ko-KR, en-US 등)
 * @param options - Intl.NumberFormat 옵션
 * @returns 포맷팅된 숫자 문자열
 *
 * @example
 * formatNumber(1000000, 'ko-KR')
 * // Returns: '1,000,000'
 *
 * formatNumber(1234.56, 'en-US')
 * // Returns: '1,234.56'
 */
export function formatNumber(
  value: number,
  locale: string = 'ko-KR',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * 통화 문자열 파싱 (숫자로 변환)
 *
 * @param currencyString - 통화 문자열 (예: '₩1,000,000', '$1,234.56')
 * @returns 파싱된 숫자
 *
 * @example
 * parseCurrency('₩1,000,000')
 * // Returns: 1000000
 *
 * parseCurrency('$1,234.56')
 * // Returns: 1234.56
 */
export function parseCurrency(currencyString: string): number {
  // 숫자와 소수점을 제외한 모든 문자 제거
  const cleaned = currencyString.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    throw new Error(`Invalid currency string: ${currencyString}`);
  }

  return parsed;
}

/**
 * 로케일 기반 숫자 파싱
 *
 * @param numberString - 숫자 문자열 (예: '1,000', '1.234,56')
 * @param locale - 로케일 (ko-KR, en-US 등)
 * @returns 파싱된 숫자
 *
 * @example
 * parseNumber('1,000', 'ko-KR')
 * // Returns: 1000
 *
 * parseNumber('1,234.56', 'en-US')
 * // Returns: 1234.56
 */
export function parseNumber(numberString: string, locale: string = 'ko-KR'): number {
  // 로케일별 천 단위 구분자 및 소수점 처리
  let cleaned = numberString;

  if (locale.startsWith('ko')) {
    // 한국어: 쉼표는 천 단위 구분자, 점은 소수점
    cleaned = numberString.replace(/,/g, '');
  } else if (locale.startsWith('en')) {
    // 영어: 쉼표는 천 단위 구분자, 점은 소수점
    cleaned = numberString.replace(/,/g, '');
  } else if (locale.startsWith('de') || locale.startsWith('es')) {
    // 독일어/스페인어: 점은 천 단위 구분자, 쉼표는 소수점
    cleaned = numberString.replace(/\./g, '').replace(/,/g, '.');
  }

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    throw new Error(`Invalid number string: ${numberString}`);
  }

  return parsed;
}

/**
 * 퍼센트 포맷팅
 *
 * @param value - 값 (0~1 사이의 비율 또는 실제 퍼센트 값)
 * @param isRatio - true면 0~1 사이의 비율로 간주, false면 실제 퍼센트 값
 * @param locale - 로케일
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 포맷팅된 퍼센트 문자열
 *
 * @example
 * formatPercent(0.1523, true, 'ko-KR', 1)
 * // Returns: '+15.2%'
 *
 * formatPercent(-5.2, false, 'ko-KR', 1)
 * // Returns: '-5.2%'
 */
export function formatPercent(
  value: number,
  isRatio: boolean = true,
  locale: string = 'ko-KR',
  decimals: number = 1
): string {
  const percent = isRatio ? value * 100 : value;
  const sign = percent > 0 ? '+' : percent < 0 ? '-' : '';
  const absPercent = Math.abs(percent);

  return `${sign}${formatNumber(absPercent, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}
