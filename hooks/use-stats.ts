import { useQuery } from '@tanstack/react-query';
import type { PeriodSummary, GetSummaryQuery } from '@/types';

/**
 * 통계 요약 조회 훅
 *
 * @param params - 조회 파라미터 (날짜 범위)
 * @param options - React Query options (enabled 등)
 * @returns 통계 요약 데이터 (수입, 지출, 저축, 잔액 등)
 */
export function useSummary(params: GetSummaryQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['stats', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const response = await fetch(`/api/stats?${searchParams.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch summary');
      }

      const data: PeriodSummary = await response.json();
      return data;
    },
    // 통계는 자주 변경되므로 staleTime을 짧게 설정
    staleTime: 1 * 60 * 1000, // 1분
    // 날짜 범위가 제공되지 않으면 쿼리 비활성화
    enabled: options?.enabled ?? (!!params.startDate && !!params.endDate),
  });
}
