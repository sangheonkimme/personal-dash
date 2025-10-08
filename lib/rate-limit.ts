/**
 * Rate Limiting 유틸리티
 *
 * 메모리 기반 간단한 rate limiter
 * 프로덕션에서는 Redis/Upstash 사용 권장
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // 1분마다 정리

export interface RateLimitConfig {
  /**
   * 시간 창 (밀리초)
   * @default 60000 (1분)
   */
  interval?: number;

  /**
   * 시간 창 내 최대 요청 수
   * @default 10
   */
  maxRequests?: number;
}

/**
 * Rate Limiter
 *
 * @param identifier - 고유 식별자 (IP, userId 등)
 * @param config - Rate limit 설정
 * @returns { success: boolean, remaining: number, resetTime: number }
 *
 * @example
 * const result = await rateLimit(ip, { interval: 60000, maxRequests: 5 });
 * if (!result.success) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): {
  success: boolean;
  remaining: number;
  resetTime: number;
} {
  const interval = config.interval ?? 60000; // 기본 1분
  const maxRequests = config.maxRequests ?? 10; // 기본 10 요청

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // 엔트리가 없거나 시간 창이 지난 경우 새로 시작
  if (!entry || now > entry.resetTime) {
    const resetTime = now + interval;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // 시간 창 내에서 요청 카운트 증가
  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit을 적용한 API 핸들러 래퍼
 *
 * @example
 * export const POST = withRateLimit(
 *   async (request) => { ... },
 *   { interval: 60000, maxRequests: 5 }
 * );
 */
export function withRateLimit<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  config: RateLimitConfig = {}
): T {
  return (async (...args: any[]) => {
    const request = args[0] as Request;

    // IP 주소 추출 (Vercel/Render 등의 프록시 헤더 지원)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const result = rateLimit(ip, config);

    // Rate limit 헤더 추가
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(config.maxRequests ?? 10));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(result.resetTime));

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        }),
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers.entries()),
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // 원래 핸들러 실행 후 헤더 추가
    const response = await handler(...args);

    // 기존 헤더와 rate limit 헤더 병합
    for (const [key, value] of headers.entries()) {
      response.headers.set(key, value);
    }

    return response;
  }) as T;
}
