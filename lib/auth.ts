/**
 * NextAuth 설정 - 레거시 호환성을 위한 재내보내기
 *
 * NextAuth v5 사용 시 auth 함수를 직접 사용하세요.
 * 레거시 코드와의 호환성을 위해 authOptions를 제공하지만,
 * 실제로는 auth() 함수를 사용하는 것이 권장됩니다.
 */

export { auth as getServerSession } from '@/auth';
export { authConfig as authOptions } from '@/auth.config';
