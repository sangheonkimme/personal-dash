import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * 서버 컴포넌트에서 세션을 가져오는 헬퍼 함수
 */
export async function getSession() {
  return await auth();
}

/**
 * 서버 컴포넌트에서 인증된 사용자 정보를 가져오는 헬퍼 함수
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * 사용자 ID를 가져오는 헬퍼 함수
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * 인증된 사용자 ID를 가져오는 헬퍼 함수 (필수)
 * 인증되지 않은 경우 에러 발생
 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error('Unauthorized: User ID not found');
  }

  return userId;
}
