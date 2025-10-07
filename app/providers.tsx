'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * 전역 Providers 컴포넌트
 *
 * @description
 * React Query, NextAuth 등의 Provider를 한 곳에서 관리합니다.
 * 루트 레이아웃에서 사용됩니다.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* 개발 환경에서만 React Query Devtools 표시 */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
