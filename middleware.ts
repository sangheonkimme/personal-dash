import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

// next-intl 미들웨어 생성
const intlMiddleware = createIntlMiddleware(routing);

// NextAuth 미들웨어
const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest) {
  // 1. i18n 미들웨어 실행
  const intlResponse = intlMiddleware(request);

  // 2. Auth 미들웨어 실행
  // @ts-expect-error - NextAuth 타입 이슈
  const authResponse = await authMiddleware(request);

  // Auth 미들웨어가 리다이렉트를 반환하면 우선
  if (authResponse) {
    return authResponse;
  }

  // 그렇지 않으면 i18n 응답 반환
  return intlResponse;
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
