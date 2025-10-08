import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  BaseRow,
  GetTransactionsQuery,
  PaginatedResponse,
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from '@/types';

/**
 * 거래 내역 조회 훅
 *
 * @param params - 조회 파라미터 (날짜 범위, 페이지, 정렬 등)
 * @param options - React Query options (enabled 등)
 * @returns 거래 내역 목록 및 메타데이터
 */
export function useTransactions(
  params: GetTransactionsQuery,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      // 파라미터를 쿼리 스트링으로 변환
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/transactions?${searchParams.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch transactions');
      }

      const data: PaginatedResponse<BaseRow> = await response.json();
      return data;
    },
    // 데이터가 자주 변경되므로 staleTime을 짧게 설정
    staleTime: 1 * 60 * 1000, // 1분
    enabled: options?.enabled ?? true,
  });
}

/**
 * 거래 생성 훅 (옵티미스틱 업데이트)
 *
 * @returns 거래 생성 mutation
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionDTO) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create transaction');
      }

      return response.json();
    },
    // 옵티미스틱 업데이트
    onMutate: async (newTransaction) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // 이전 데이터 백업
      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] });

      // 옵티미스틱하게 UI 업데이트
      queryClient.setQueriesData<PaginatedResponse<BaseRow>>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;

          // 새 거래를 목록 맨 앞에 추가
          return {
            ...old,
            items: [
              {
                id: Date.now(), // 임시 ID
                date: newTransaction.date,
                type: newTransaction.type,
                fixed: newTransaction.fixed,
                category: newTransaction.category,
                subcategory: newTransaction.subcategory || null,
                description: newTransaction.description,
                amount: newTransaction.amount,
                paymentMethod: newTransaction.paymentMethod || null,
                tags: newTransaction.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...old.items,
            ],
            meta: {
              ...old.meta,
              totalCount: old.meta.totalCount + 1,
            },
          };
        }
      );

      return { previousTransactions };
    },
    // 에러 발생 시 롤백
    onError: (err, newTransaction, context) => {
      console.error('Create transaction error:', err);

      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // 성공 시 쿼리 무효화하여 최신 데이터 가져오기
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

/**
 * 거래 수정 훅 (옵티미스틱 업데이트)
 *
 * @returns 거래 수정 mutation
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTransactionDTO }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update transaction');
      }

      return response.json();
    },
    // 옵티미스틱 업데이트
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] });

      queryClient.setQueriesData<PaginatedResponse<BaseRow>>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    ...data,
                    updatedAt: new Date().toISOString(),
                  }
                : item
            ),
          };
        }
      );

      return { previousTransactions };
    },
    onError: (err, variables, context) => {
      console.error('Update transaction error:', err);

      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

/**
 * 거래 삭제 훅
 *
 * @returns 거래 삭제 mutation
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete transaction');
      }

      return response.json();
    },
    // 옵티미스틱 업데이트
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] });

      queryClient.setQueriesData<PaginatedResponse<BaseRow>>(
        { queryKey: ['transactions'] },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.filter((item) => item.id !== id),
            meta: {
              ...old.meta,
              totalCount: old.meta.totalCount - 1,
            },
          };
        }
      );

      return { previousTransactions };
    },
    onError: (err, id, context) => {
      console.error('Delete transaction error:', err);

      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
