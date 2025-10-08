/**
 * XSS 방지를 위한 입력 Sanitization 유틸리티
 *
 * HTML 태그, 스크립트, 위험한 문자열 제거
 * 프로덕션에서는 DOMPurify 같은 라이브러리 사용 권장
 */

/**
 * HTML 태그 및 위험한 문자열 제거
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // 스크립트 관련 문자열 제거
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // 특수 문자 이스케이프
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * SQL Injection 방지를 위한 문자열 정리
 * (Prisma ORM이 자동으로 처리하지만 추가 보안 계층)
 */
export function sanitizeSql(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
}

/**
 * 일반 텍스트 입력 정리
 * (description, category 등에 사용)
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return sanitizeHtml(input)
    .slice(0, maxLength)
    .trim();
}

/**
 * 숫자 입력 검증 및 정리
 */
export function sanitizeNumber(input: unknown): number | null {
  if (typeof input === 'number') {
    return isFinite(input) ? input : null;
  }

  if (typeof input === 'string') {
    const num = parseFloat(input.replace(/[^\d.-]/g, ''));
    return isFinite(num) ? num : null;
  }

  return null;
}

/**
 * 객체의 모든 문자열 필드 sanitize
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value) as T[Extract<keyof T, string>];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * URL 검증 및 정리
 */
export function sanitizeUrl(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  try {
    const url = new URL(input);

    // http, https만 허용
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    // javascript:, data:, file: 등 위험한 프로토콜 차단
    if (/^(javascript|data|file|vbscript):/i.test(input)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
