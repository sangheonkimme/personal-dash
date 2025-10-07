import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 지원하는 로케일 목록
  locales: ['ko', 'en'],

  // 기본 로케일
  defaultLocale: 'ko',

  // URL에 로케일 접두사 추가 (예: /ko/dashboard, /en/dashboard)
  localePrefix: 'always',
});

// 타입 안전 내비게이션 유틸리티
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
