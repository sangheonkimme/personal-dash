/**
 * Audit Logging 유틸리티
 *
 * 보안 관련 주요 이벤트 로깅 (GDPR/PIPA 준수)
 * 프로덕션에서는 별도 로그 저장소 (DB, CloudWatch, Datadog 등) 사용 권장
 */

export enum AuditEventType {
  // 인증 관련
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',

  // 계정 관련
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_SETTINGS_UPDATED = 'USER_SETTINGS_UPDATED',

  // 거래 관련
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',
  TRANSACTION_DELETED = 'TRANSACTION_DELETED',
  BULK_TRANSACTION_DELETE = 'BULK_TRANSACTION_DELETE',

  // 보안 관련
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // 데이터 내보내기
  DATA_EXPORT = 'DATA_EXPORT',
}

export interface AuditLogEntry {
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}

/**
 * Audit 로그 기록
 *
 * @example
 * await logAuditEvent({
 *   eventType: AuditEventType.USER_LOGIN,
 *   userId: 'user123',
 *   ip: '192.168.1.1',
 *   success: true
 * });
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // 프로덕션: DB 또는 외부 로그 서비스에 저장
  // 개발: 콘솔 출력
  if (process.env.NODE_ENV === 'production') {
    // TODO: 프로덕션 로그 저장소에 저장
    // await saveToLogStore(logEntry);
    console.log('[AUDIT]', JSON.stringify(logEntry));
  } else {
    console.log('[AUDIT]', logEntry);
  }

  // 중요 이벤트는 별도 알림 (선택적)
  if (isCriticalEvent(entry.eventType) && !entry.success) {
    // TODO: 알림 전송 (Slack, Email 등)
    console.warn('[AUDIT ALERT]', logEntry);
  }
}

/**
 * Request 객체에서 IP와 User Agent 추출
 */
export function extractRequestMetadata(request: Request): {
  ip: string;
  userAgent: string;
} {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ip, userAgent };
}

/**
 * 중요 이벤트 판별
 */
function isCriticalEvent(eventType: AuditEventType): boolean {
  return [
    AuditEventType.USER_DELETED,
    AuditEventType.RATE_LIMIT_EXCEEDED,
    AuditEventType.UNAUTHORIZED_ACCESS,
    AuditEventType.SUSPICIOUS_ACTIVITY,
    AuditEventType.BULK_TRANSACTION_DELETE,
  ].includes(eventType);
}

/**
 * 사용자별 최근 로그 조회 (프로덕션용)
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50
): Promise<AuditLogEntry[]> {
  // TODO: DB에서 사용자별 로그 조회
  // const logs = await prisma.auditLog.findMany({
  //   where: { userId },
  //   orderBy: { timestamp: 'desc' },
  //   take: limit,
  // });
  // return logs;

  console.log(`Fetching audit logs for user ${userId}, limit ${limit}`);
  return [];
}
