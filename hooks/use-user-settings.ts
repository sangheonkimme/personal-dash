import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateUserSettingsDTO, ApiSuccessResponse } from '@/types';

/**
 * User 타입 정의 (간소화된 버전)
 */
interface UserSettings {
  salaryDay: number | null;
  currency: string | null;
  locale: string | null;
  name: string | null;
  email: string | null;
}

/**
 * 사용자 설정 조회 훅
 *
 * @returns 사용자 설정 데이터
 */
export function useUserSettings() {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await fetch('/api/user/settings');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch user settings');
      }

      const result: ApiSuccessResponse<UserSettings> = await response.json();
      return result.data;
    },
    // 사용자 설정은 거의 변경되지 않으므로 staleTime을 길게 설정
    staleTime: 30 * 60 * 1000, // 30분
  });
}

/**
 * 사용자 설정 업데이트 훅
 *
 * @returns 사용자 설정 업데이트 mutation
 */
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserSettingsDTO) => {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update user settings');
      }

      return response.json();
    },
    // 옵티미스틱 업데이트
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['userSettings'] });

      const previousSettings = queryClient.getQueryData<UserSettings>(['userSettings']);

      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(['userSettings'], {
          ...previousSettings,
          ...newSettings,
        });
      }

      return { previousSettings };
    },
    onError: (err, variables, context) => {
      console.error('Update user settings error:', err);

      if (context?.previousSettings) {
        queryClient.setQueryData(['userSettings'], context.previousSettings);
      }
    },
    onSuccess: async () => {
      // 무효화 후 즉시 refetch하여 최신 데이터 보장
      await queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      // salaryDay 변경 시 급여월도 무효화
      await queryClient.invalidateQueries({ queryKey: ['payPeriod'] });
    },
  });
}
