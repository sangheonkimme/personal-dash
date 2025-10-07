/**
 * @jest-environment node
 */

import { getPayPeriod, getPayPeriodRange, isSamePayPeriod } from '@/lib/utils/pay-period';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('getPayPeriod', () => {
  describe('일반 케이스 (1~28일)', () => {
    test('salaryDay=25, anchorDate가 급여일 이후인 경우', () => {
      const result = getPayPeriod('2025-10-30T00:00:00Z', 25, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2025-10-25').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-11-25').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 10월');
    });

    test('salaryDay=25, anchorDate가 급여일 이전인 경우', () => {
      const result = getPayPeriod('2025-10-15T00:00:00Z', 25, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2025-09-25').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-10-25').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 9월');
    });

    test('salaryDay=25, anchorDate가 정확히 급여일인 경우', () => {
      const result = getPayPeriod('2025-10-25T00:00:00Z', 25, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2025-10-25').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-11-25').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 10월');
    });

    test('salaryDay=1 (매월 1일)', () => {
      const result = getPayPeriod('2025-10-15T00:00:00Z', 1, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2025-10-01').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-11-01').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 10월');
    });

    test('salaryDay=15 (중순)', () => {
      const result = getPayPeriod('2025-10-20T00:00:00Z', 15, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2025-10-15').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-11-15').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 10월');
    });
  });

  describe('경계 케이스 (29, 30, 31일)', () => {
    test('salaryDay=31, 31일이 있는 월 (1월)', () => {
      const result = getPayPeriod('2025-01-31T00:00:00Z', 31, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2025-01-31').tz('Asia/Seoul').startOf('day').toISOString());
      // 다음 급여일(2월 28일) 00:00 - 1ms = 2월 27일 23:59:59.999
      expect(result.endISO).toBe(
        dayjs('2025-02-28').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 1월');
    });

    test('salaryDay=31, 30일까지만 있는 월 (4월)', () => {
      const result = getPayPeriod('2025-04-15T00:00:00Z', 31, 'Asia/Seoul');

      // 4월은 30일까지 → 3월 31일 ~ 4월 30일 (4월 30일 보정)
      expect(result.startISO).toBe(dayjs('2025-03-31').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-04-30').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 3월');
    });

    test('salaryDay=31, 2월을 포함하는 경우 (평년)', () => {
      const result = getPayPeriod('2025-02-15T00:00:00Z', 31, 'Asia/Seoul');

      // 2025년 2월은 28일까지 → 1월 31일 ~ 2월 27일 23:59:59.999
      expect(result.startISO).toBe(dayjs('2025-01-31').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-02-28').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 1월');
    });

    test('salaryDay=31, 2월을 포함하는 경우 (윤년)', () => {
      const result = getPayPeriod('2024-02-15T00:00:00Z', 31, 'Asia/Seoul');

      // 2024년 2월은 29일까지 → 1월 31일 ~ 2월 28일 23:59:59.999
      expect(result.startISO).toBe(dayjs('2024-01-31').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2024-02-29').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2024년 1월');
    });

    test('salaryDay=30, 2월을 포함하는 경우 (평년)', () => {
      const result = getPayPeriod('2025-02-15T00:00:00Z', 30, 'Asia/Seoul');

      // 2월은 28일까지 → 1월 30일 ~ 2월 27일 23:59:59.999
      expect(result.startISO).toBe(dayjs('2025-01-30').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-02-28').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 1월');
    });

    test('salaryDay=29, 2월을 포함하는 경우 (평년)', () => {
      const result = getPayPeriod('2025-02-15T00:00:00Z', 29, 'Asia/Seoul');

      // 2월은 28일까지 → 1월 29일 ~ 2월 27일 23:59:59.999
      expect(result.startISO).toBe(dayjs('2025-01-29').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-02-28').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 1월');
    });

    test('salaryDay=29, 2월을 포함하는 경우 (윤년)', () => {
      const result = getPayPeriod('2024-02-29T00:00:00Z', 29, 'Asia/Seoul');

      // 2024년 2월 29일 (윤년)
      expect(result.startISO).toBe(dayjs('2024-02-29').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2024-03-29').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2024년 2월');
    });
  });

  describe('월 경계 넘어가는 케이스', () => {
    test('연도가 바뀌는 경우 (12월 → 1월)', () => {
      const result = getPayPeriod('2024-12-31T00:00:00Z', 25, 'Asia/Seoul');

      expect(result.startISO).toBe(dayjs('2024-12-25').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-01-25').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2024년 12월');
    });

    test('1월 → 2월 (평년, salaryDay=31)', () => {
      const result = getPayPeriod('2025-02-01T00:00:00Z', 31, 'Asia/Seoul');

      // 1월 31일 ~ 2월 27일 23:59:59.999 (2025년은 평년, 2월은 28일까지)
      expect(result.startISO).toBe(dayjs('2025-01-31').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-02-28').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 1월');
    });

    test('2월 → 3월 (평년, salaryDay=31)', () => {
      const result = getPayPeriod('2025-03-01T00:00:00Z', 31, 'Asia/Seoul');

      // 2월 28일 ~ 3월 31일
      expect(result.startISO).toBe(dayjs('2025-02-28').tz('Asia/Seoul').startOf('day').toISOString());
      expect(result.endISO).toBe(
        dayjs('2025-03-31').tz('Asia/Seoul').startOf('day').subtract(1, 'millisecond').toISOString()
      );
      expect(result.label).toBe('2025년 2월');
    });
  });

  describe('타임존 처리', () => {
    test('UTC 타임존', () => {
      const result = getPayPeriod('2025-10-15T00:00:00Z', 25, 'UTC');

      // 10월 15일은 10월 25일 이전이므로 9월 25일부터 시작하는 급여월에 속함
      expect(result.startISO).toBe('2025-09-25T00:00:00.000Z');
      expect(result.endISO).toBe('2025-10-24T23:59:59.999Z');
      expect(result.label).toBe('2025년 9월'); // formatPeriodLabel이 기본 한국어 사용
    });

    test('America/New_York 타임존', () => {
      const result = getPayPeriod('2025-10-15T00:00:00Z', 25, 'America/New_York');

      // New York 타임존 (EDT: UTC-4)
      expect(result.startISO).toBe('2025-09-25T04:00:00.000Z'); // 09-25 00:00:00 EDT
      expect(result.endISO).toBe('2025-10-25T03:59:59.999Z'); // 10-24 23:59:59.999 EDT
      expect(result.label).toBe('2025년 9월');
    });
  });

  describe('에러 처리', () => {
    test('salaryDay가 1보다 작은 경우', () => {
      expect(() => {
        getPayPeriod('2025-10-15T00:00:00Z', 0, 'Asia/Seoul');
      }).toThrow('salaryDay must be between 1 and 31');
    });

    test('salaryDay가 31보다 큰 경우', () => {
      expect(() => {
        getPayPeriod('2025-10-15T00:00:00Z', 32, 'Asia/Seoul');
      }).toThrow('salaryDay must be between 1 and 31');
    });
  });
});

describe('getPayPeriodRange', () => {
  test('기본 범위 생성 (±12개월)', () => {
    const result = getPayPeriodRange('2025-10-15T00:00:00Z', 25, 12, 12, 'Asia/Seoul');

    expect(result).toHaveLength(25); // 12 + 1 (현재) + 12
    expect(result[0].label).toBe('2024년 9월'); // 12개월 전
    expect(result[12].label).toBe('2025년 9월'); // 현재
    expect(result[24].label).toBe('2026년 9월'); // 12개월 후
  });

  test('±6개월 범위', () => {
    const result = getPayPeriodRange('2025-10-15T00:00:00Z', 25, 6, 6, 'Asia/Seoul');

    expect(result).toHaveLength(13); // 6 + 1 + 6
    expect(result[0].label).toBe('2025년 3월'); // 6개월 전
    expect(result[6].label).toBe('2025년 9월'); // 현재
    expect(result[12].label).toBe('2026년 3월'); // 6개월 후
  });

  test('연속된 급여월들이 정확히 연결되는지 확인', () => {
    const result = getPayPeriodRange('2025-10-15T00:00:00Z', 25, 2, 2, 'Asia/Seoul');

    // 각 급여월의 종료일 + 1ms = 다음 급여월의 시작일
    for (let i = 0; i < result.length - 1; i++) {
      const currentEnd = dayjs(result[i].endISO);
      const nextStart = dayjs(result[i + 1].startISO);

      expect(currentEnd.add(1, 'millisecond').valueOf()).toBe(nextStart.valueOf());
    }
  });
});

describe('isSamePayPeriod', () => {
  test('같은 급여월에 속하는 두 날짜', () => {
    const result = isSamePayPeriod(
      '2025-10-25T00:00:00Z',
      '2025-11-20T00:00:00Z',
      25,
      'Asia/Seoul'
    );

    expect(result).toBe(true);
  });

  test('다른 급여월에 속하는 두 날짜', () => {
    const result = isSamePayPeriod(
      '2025-10-20T00:00:00Z',
      '2025-11-20T00:00:00Z',
      25,
      'Asia/Seoul'
    );

    expect(result).toBe(false);
  });

  test('급여일 경계에서의 비교', () => {
    // 급여월 경계를 제대로 확인하기 위한 테스트
    // salaryDay=25인 경우:
    // - 9월 25일 00:00 ~ 10월 24일 23:59:59.999
    // - 10월 25일 00:00 ~ 11월 24일 23:59:59.999

    const date1 = '2025-10-24T14:59:59Z'; // Asia/Seoul = 10월 24일 23:59:59 (급여월 종료 직전)
    const date2 = '2025-10-24T15:00:00Z'; // Asia/Seoul = 10월 25일 00:00:00 (다음 급여월 시작)

    const result = isSamePayPeriod(date1, date2, 25, 'Asia/Seoul');

    expect(result).toBe(false);
  });

  test('2월 경계 케이스 (salaryDay=31, 평년)', () => {
    const result = isSamePayPeriod(
      '2025-02-15T00:00:00Z',
      '2025-02-27T00:00:00Z',
      31,
      'Asia/Seoul'
    );

    expect(result).toBe(true); // 둘 다 1월 31일 ~ 2월 28일 기간에 속함
  });
});
