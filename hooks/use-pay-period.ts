import { useQuery } from '@tanstack/react-query';
import type { PayPeriod, GetPayPeriodQuery } from '@/types';

/**
 * 급여월 조회 훅
 *
 * @param params - 조회 파라미터 (기준 날짜)
 * @returns 급여월 정보 (시작일, 종료일, 라벨)
 */
export function usePayPeriod(params: GetPayPeriodQuery) {
  return useQuery({
    queryKey: ['payPeriod', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('anchorDate', params.anchorDate);

      const response = await fetch(`/api/period?${searchParams.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch pay period');
      }

      const data: PayPeriod = await response.json();
      return data;
    },
    // 급여월은 거의 변경되지 않으므로 staleTime을 길게 설정
    staleTime: 60 * 60 * 1000, // 1시간
    // anchorDate가 제공되지 않으면 쿼리 비활성화
    enabled: !!params.anchorDate,
  });
}
