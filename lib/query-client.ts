import { QueryClient } from '@tanstack/react-query';

/**
 * React Query QueryClient 설정
 *
 * @description
 * 전역 QueryClient 인스턴스를 생성하고 기본 옵션을 설정합니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분 동안 데이터를 fresh 상태로 유지
      staleTime: 5 * 60 * 1000,

      // 30분 동안 캐시 유지
      gcTime: 30 * 60 * 1000,

      // 에러 발생 시 3번까지 재시도
      retry: 3,

      // 재시도 지연 시간 (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 윈도우 포커스 시 자동 refetch
      refetchOnWindowFocus: true,

      // 네트워크 재연결 시 자동 refetch
      refetchOnReconnect: true,

      // 마운트 시 refetch 비활성화 (staleTime 내)
      refetchOnMount: false,
    },
    mutations: {
      // 뮤테이션 에러 발생 시 재시도 안 함
      retry: false,

      // 에러 발생 시 콘솔에 로그
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

/**
 * QueryClient를 생성하는 팩토리 함수
 *
 * @description
 * 서버 컴포넌트나 테스트에서 새로운 QueryClient를 생성할 때 사용
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryClient.getDefaultOptions(),
  });
}
