import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { PayPeriod } from '@/types';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 급여월 계산 함수
 *
 * @description
 * 사용자가 설정한 salaryDay를 기준으로 급여월의 시작일과 종료일을 계산합니다.
 * 예: salaryDay = 25
 * - 2025-10-25 00:00:00 ~ 2025-11-24 23:59:59.999
 *
 * @param anchorDate - 기준 날짜 (ISO 8601 format)
 * @param salaryDay - 급여일 (1~31)
 * @param tz - 타임존 (기본값: Asia/Seoul)
 *
 * @returns {PayPeriod} 급여월 정보 (startISO, endISO, label)
 *
 * @example
 * getPayPeriod('2025-10-15T00:00:00Z', 25, 'Asia/Seoul')
 * // Returns:
 * // {
 * //   startISO: '2025-09-25T00:00:00+09:00',
 * //   endISO: '2025-10-24T23:59:59.999+09:00',
 * //   label: '2025년 9월'
 * // }
 *
 * @remarks
 * - 29/30/31일 설정 시 월별 마지막 날로 자동 보정 (2월 대응)
 * - 윤년/평년 자동 처리
 * - 월 경계 케이스 처리 (1일 설정 시 매월 1일 00:00 ~ 말일 23:59:59)
 */
export function getPayPeriod(
  anchorDate: string,
  salaryDay: number,
  tz: string = 'Asia/Seoul'
): PayPeriod {
  // 입력 검증
  if (salaryDay < 1 || salaryDay > 31) {
    throw new Error('salaryDay must be between 1 and 31');
  }

  // anchorDate를 지정된 타임존으로 변환
  const anchor = dayjs(anchorDate).tz(tz);

  // anchorDate가 속한 급여월의 시작일 계산
  let periodStart: dayjs.Dayjs;

  // 현재 월에서 salaryDay에 해당하는 날짜 계산 (보정 포함)
  const currentMonthSalaryDay = getAdjustedSalaryDay(anchor.year(), anchor.month(), salaryDay);
  const salaryDayThisMonth = anchor.year(anchor.year()).month(anchor.month()).date(currentMonthSalaryDay).startOf('day');

  // anchorDate가 이번 달 급여일보다 이전이면, 지난 달부터 시작
  if (anchor.isBefore(salaryDayThisMonth)) {
    const prevMonth = anchor.subtract(1, 'month');
    const prevMonthSalaryDay = getAdjustedSalaryDay(prevMonth.year(), prevMonth.month(), salaryDay);
    periodStart = prevMonth.date(prevMonthSalaryDay).startOf('day');
  } else {
    // anchorDate가 이번 달 급여일 이후면, 이번 달부터 시작
    periodStart = salaryDayThisMonth;
  }

  // 급여월 종료일 계산 (다음 달 급여일 전날 23:59:59.999)
  const nextMonth = periodStart.add(1, 'month');
  const nextMonthSalaryDay = getAdjustedSalaryDay(nextMonth.year(), nextMonth.month(), salaryDay);
  const periodEnd = nextMonth
    .date(nextMonthSalaryDay)
    .startOf('day')
    .subtract(1, 'millisecond'); // 다음 달 급여일 00:00:00의 1ms 전

  // 라벨 생성 (급여월 시작일 기준)
  const label = formatPeriodLabel(periodStart, 'ko-KR'); // 기본 한국어, 추후 locale 파라미터 추가 가능

  return {
    startISO: periodStart.toISOString(),
    endISO: periodEnd.toISOString(),
    label,
  };
}

/**
 * 월별 salaryDay 보정 함수
 *
 * @description
 * 29/30/31일 설정 시 해당 월의 마지막 날짜로 보정합니다.
 * 예: salaryDay = 31, 2025년 2월 → 28일 (평년) or 29일 (윤년)
 *
 * @param year - 연도
 * @param month - 월 (0-based: 0 = January, 11 = December)
 * @param salaryDay - 급여일 (1~31)
 * @returns 보정된 날짜 (1~31)
 */
function getAdjustedSalaryDay(year: number, month: number, salaryDay: number): number {
  const daysInMonth = dayjs().year(year).month(month).daysInMonth();
  return Math.min(salaryDay, daysInMonth);
}

/**
 * 급여월 라벨 포맷팅
 *
 * @param date - dayjs 객체
 * @param locale - 로케일 (ko-KR, en-US 등)
 * @returns 포맷팅된 라벨 (예: "2025년 10월", "October 2025")
 */
function formatPeriodLabel(date: dayjs.Dayjs, locale: string = 'ko-KR'): string {
  if (locale === 'ko-KR' || locale === 'ko') {
    return `${date.year()}년 ${date.month() + 1}월`;
  } else {
    // en-US 또는 기타 로케일
    return date.format('MMMM YYYY');
  }
}

/**
 * 급여월 범위 생성 함수
 *
 * @description
 * 현재 급여월을 기준으로 앞뒤 N개월의 급여월 목록을 생성합니다.
 * PeriodChips 컴포넌트에서 사용됩니다.
 *
 * @param anchorDate - 기준 날짜 (ISO 8601 format)
 * @param salaryDay - 급여일 (1~31)
 * @param beforeCount - 이전 개월 수 (기본값: 12)
 * @param afterCount - 이후 개월 수 (기본값: 12)
 * @param tz - 타임존 (기본값: Asia/Seoul)
 * @returns PayPeriod 배열 (과거 → 미래 순서)
 */
export function getPayPeriodRange(
  anchorDate: string,
  salaryDay: number,
  beforeCount: number = 12,
  afterCount: number = 12,
  tz: string = 'Asia/Seoul'
): PayPeriod[] {
  const periods: PayPeriod[] = [];

  // 현재 급여월 계산
  const currentPeriod = getPayPeriod(anchorDate, salaryDay, tz);
  const currentStart = dayjs(currentPeriod.startISO).tz(tz);

  // 이전 개월 생성
  for (let i = beforeCount; i >= 1; i--) {
    const targetDate = currentStart.subtract(i, 'month').toISOString();
    periods.push(getPayPeriod(targetDate, salaryDay, tz));
  }

  // 현재 급여월 추가
  periods.push(currentPeriod);

  // 이후 개월 생성
  for (let i = 1; i <= afterCount; i++) {
    const targetDate = currentStart.add(i, 'month').toISOString();
    periods.push(getPayPeriod(targetDate, salaryDay, tz));
  }

  return periods;
}

/**
 * 두 날짜가 같은 급여월에 속하는지 확인
 *
 * @param date1 - 첫 번째 날짜 (ISO 8601 format)
 * @param date2 - 두 번째 날짜 (ISO 8601 format)
 * @param salaryDay - 급여일 (1~31)
 * @param tz - 타임존 (기본값: Asia/Seoul)
 * @returns 같은 급여월이면 true
 */
export function isSamePayPeriod(
  date1: string,
  date2: string,
  salaryDay: number,
  tz: string = 'Asia/Seoul'
): boolean {
  const period1 = getPayPeriod(date1, salaryDay, tz);
  const period2 = getPayPeriod(date2, salaryDay, tz);

  return period1.startISO === period2.startISO && period1.endISO === period2.endISO;
}
